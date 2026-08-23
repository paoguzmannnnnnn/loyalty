import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('businesses')
export class BusinessController {
    constructor(private readonly business: BusinessService) {}

    // crear: exige token válido Y rol 'business'
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('business')
    @Post()
    create(@Body() dto: CreateBusinessDto) {
        return this.business.create(dto);
    }

    // listar: cualquiera autenticado puede ver los negocios
    @UseGuards(JwtAuthGuard)
    @Get()
    findAll() {
        return this.business.findAll();
  }
}