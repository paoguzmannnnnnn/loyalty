import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Membership } from './membership.entity';
import { StampTransaction } from './stamp-transaction.entity';

export type AuditAction = 'stamp_issued' | 'reward_redeemed' | 'stamp_reverted';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // qué pasó
    @Column({ type: 'varchar' })
    action: AuditAction;

    // quién lo hizo (el usuario del negocio)
    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    actor: User | null;

    // sobre qué tarjeta/cliente
    @ManyToOne(() => Membership, { onDelete: 'SET NULL', nullable: true })
    membership: Membership | null;

    // a qué transacción del ledger se refiere (para poder revertirla)
    @ManyToOne(() => StampTransaction, { onDelete: 'SET NULL', nullable: true })
    transaction: StampTransaction | null;

    // cuándo
    @CreateDateColumn()
    createdAt: Date;
}