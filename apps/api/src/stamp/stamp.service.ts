import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryFailedError } from 'typeorm';
import { Membership } from '../database/entities/membership.entity';
import { StampTransaction } from '../database/entities/stamp-transaction.entity';
import { AuditLog } from '../database/entities/audit-log.entity';

@Injectable()
export class StampService {
    constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

    async issue(membershipId: string, idempotencyKey: string, actorId: string) {
        return this.dataSource.transaction(async (manager) => {
        const membership = await manager.findOne(Membership, {
            where: { id: membershipId },
            relations: { business: true },
        });
        if (!membership) throw new NotFoundException('Tarjeta no encontrada');

        let txId: string;
        try {
            const inserted = await manager.insert(StampTransaction, {
            membership: { id: membershipId },
            delta: 1,
            idempotencyKey,
        });
        txId = inserted.identifiers[0].id as string;
        } catch (err) {
            if (err instanceof QueryFailedError && (err as any).code === '23505') {
            throw new ConflictException(
                'Este sello ya fue registrado (idempotencyKey repetida)',
            );
            }
            throw err;
        }

        membership.stampBalance += 1;
        const required = membership.business.stampsRequired;
        const rewardEarned = membership.stampBalance >= required;
        if (rewardEarned) {
            membership.stampBalance = 0;
            membership.rewardsAvailable += 1;
        }

        await manager.save(membership);

        // registro de auditoría
        await manager.insert(AuditLog, {
            action: 'stamp_issued',
            actor: { id: actorId },
            membership: { id: membershipId },
            transaction: { id: txId },
        });

        return {
            membershipId,
            rewardEarned,
            stampBalance: membership.stampBalance,
            stampsRequired: required,
            rewardsAvailable: membership.rewardsAvailable,
        };
        });
    }

    async redeem(membershipId: string, actorId: string) {
        return this.dataSource.transaction(async (manager) => {
        const membership = await manager.findOne(Membership, {
            where: { id: membershipId },
            relations: { business: true },
        });
        if (!membership) throw new NotFoundException('Tarjeta no encontrada');

        if (membership.rewardsAvailable <= 0) {
            throw new ConflictException('No hay recompensas para canjear');
        }

        membership.rewardsAvailable -= 1;
        await manager.save(membership);

        await manager.insert(AuditLog, {
            action: 'reward_redeemed',
            actor: { id: actorId },
            membership: { id: membershipId },
        });

        return {
            membershipId,
            stampBalance: membership.stampBalance,
            stampsRequired: membership.business.stampsRequired,
            rewardsAvailable: membership.rewardsAvailable,
        };
        });
    }

    async revertir(transactionId: string, actorId: string) {
    return this.dataSource.transaction(async (manager) => {
      // buscar la transacción original
        const original = await manager.findOne(StampTransaction, {
            where: { id: transactionId },
            relations: { membership: true },
        });
        if (!original) throw new NotFoundException('Sello no encontrado');
        if (original.delta < 0) {
            throw new ConflictException('Este registro ya es una reversión');
        }

        // ¿ya fue revertido antes? (evita revertir dos veces)
        const yaRevertido = await manager.findOne(StampTransaction, {
            where: { idempotencyKey: `revert-${transactionId}` },
        });
        if (yaRevertido) {
            throw new ConflictException('Este sello ya fue revertido');
        }

        const membershipId = original.membership.id;

        // fila de reversión: delta -1, no borra nada
        const rev = await manager.insert(StampTransaction, {
            membership: { id: membershipId },
            delta: -1,
            idempotencyKey: `revert-${transactionId}`,
        });

        // ajustar el balance (sin bajar de 0)
        const membership = await manager.findOne(Membership, {
            where: { id: membershipId },
            relations: { business: true },
        });
        if (membership) {
            membership.stampBalance = Math.max(0, membership.stampBalance - 1);
            await manager.save(membership);
        }

        // registrar en el audit
        await manager.insert(AuditLog, {
            action: 'stamp_reverted',
            actor: { id: actorId },
            membership: { id: membershipId },
            transaction: { id: rev.identifiers[0].id as string },
        });

        return { reverted: true, transactionId };
        });
    }

    async status(membershipId: string) {
        const membership = await this.dataSource.getRepository(Membership).findOne({
        where: { id: membershipId },
        relations: { business: true },
        });
        if (!membership) throw new NotFoundException('Tarjeta no encontrada');

        return {
        membershipId,
        stampBalance: membership.stampBalance,
        stampsRequired: membership.business.stampsRequired,
        rewardsAvailable: membership.rewardsAvailable,
        };
    }

    // lista del audit, con filtros opcionales
    async auditoria(filtros: { action?: string; membershipId?: string }) {
        const qb = this.dataSource
        .getRepository(AuditLog)
        .createQueryBuilder('log')
        .leftJoinAndSelect('log.actor', 'actor')
        .leftJoinAndSelect('log.membership', 'membership')
        .leftJoinAndSelect('membership.user', 'cliente')
        .leftJoinAndSelect('log.transaction', 'transaction')
        .orderBy('log.createdAt', 'DESC')
        .limit(100);

        if (filtros.action) {
        qb.andWhere('log.action = :action', { action: filtros.action });
        }
        if (filtros.membershipId) {
        qb.andWhere('membership.id = :mid', { mid: filtros.membershipId });
        }

        const logs = await qb.getMany();

        // qué sellos ya fueron revertidos (sus reversiones tienen key "revert-<id>")
        const reverts = await this.dataSource
        .getRepository(StampTransaction)
        .createQueryBuilder('t')
        .select('t.idempotencyKey', 'key')
        .where("t.idempotencyKey LIKE 'revert-%'")
        .getRawMany<{ key: string }>();
        const revertidos = new Set(reverts.map((r) => r.key.replace('revert-', '')));

        return logs.map((l) => ({
        id: l.id,
        action: l.action,
        actor: l.actor?.name ?? '—',
        cliente: (l.membership as any)?.user?.name ?? '—',
        membershipId: l.membership?.id ?? null,
        transactionId: l.transaction?.id ?? null,
        reverted:
            l.action === 'stamp_issued' && l.transaction?.id
            ? revertidos.has(l.transaction.id)
            : false,
        createdAt: l.createdAt,
        }));
    }}