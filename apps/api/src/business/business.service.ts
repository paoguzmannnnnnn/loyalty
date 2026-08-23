import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../database/entities/business.entity';
import { CreateBusinessDto } from './dto/create-business.dto';

@Injectable()
export class BusinessService {
    constructor(
        @InjectRepository(Business)
        private readonly businesses: Repository<Business>,
    ) {}

    create(dto: CreateBusinessDto) {
        const business = this.businesses.create({
        name: dto.name,
        stampsRequired: dto.stampsRequired,
        });
        return this.businesses.save(business);
    }

    findAll() {
        return this.businesses.find();
    }
}