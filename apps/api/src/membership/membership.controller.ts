import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { JoinBusinessDto } from './dto/join-business.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

type AuthedRequest = { user: { id: string; email: string; role: string } };

@Controller('memberships')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer') // solo clientes manejan tarjetas
export class MembershipController {
    constructor(private readonly memberships: MembershipService) {}

    // unirse a un negocio (el userId sale del token, no del body)
    @Post('join')
    join(@Req() req: AuthedRequest, @Body() dto: JoinBusinessDto) {
        return this.memberships.join(req.user.id, dto.businessId);
    }

    // ver mis tarjetas
    @Get('me')
    findMine(@Req() req: AuthedRequest) {
        return this.memberships.findMine(req.user.id);
    }
}