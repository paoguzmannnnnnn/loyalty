import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membership } from '../database/entities/membership.entity';
import { Business } from '../database/entities/business.entity';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';

@Module({
    imports: [TypeOrmModule.forFeature([Membership, Business])],
    controllers: [MembershipController],
    providers: [MembershipService],
})
export class MembershipModule {}