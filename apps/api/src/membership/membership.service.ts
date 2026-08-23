import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership } from '../database/entities/membership.entity';
import { Business } from '../database/entities/business.entity';

@Injectable()
export class MembershipService {
    constructor(
        @InjectRepository(Membership)
        private readonly memberships: Repository<Membership>,
        @InjectRepository(Business)
        private readonly businesses: Repository<Business>,
    ) {}

    async join(userId: string, businessId: string) {
        // 1. el negocio debe existir
        const business = await this.businesses.findOne({
        where: { id: businessId },
        });
        if (!business) throw new NotFoundException('Negocio no encontrado');

        // 2. no permitir dos tarjetas del mismo cliente en el mismo negocio
        const existing = await this.memberships.findOne({
        where: { user: { id: userId }, business: { id: businessId } },
        });
        if (existing) {
        throw new ConflictException('Ya tienes una tarjeta en este negocio');
        }

        // 3. crear la tarjeta en 0 sellos
        const membership = this.memberships.create({
        user: { id: userId },
        business: { id: businessId },
        stampBalance: 0,
        });
        return this.memberships.save(membership);
    }

    // las tarjetas del cliente logueado, con su negocio incluido
    findMine(userId: string) {
        return this.memberships.find({
        where: { user: { id: userId } },
        relations: { business: true },
        });
    }
}