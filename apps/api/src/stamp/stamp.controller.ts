import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { StampService } from './stamp.service';
import { IssueStampDto } from './dto/issue-stamp.dto';
import { RedeemDto } from './dto/redeem.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

type AuthedRequest = { user: { id: string; email: string; role: string } };

@Controller('stamps')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('business')
export class StampController {
    constructor(private readonly stamps: StampService) {}

    @Post('issue')
    issue(@Req() req: AuthedRequest, @Body() dto: IssueStampDto) {
        return this.stamps.issue(dto.membershipId, dto.idempotencyKey, req.user.id);
    }

    @Post('redeem')
    redeem(@Req() req: AuthedRequest, @Body() dto: RedeemDto) {
        return this.stamps.redeem(dto.membershipId, req.user.id);
    }

    @Post('revert')
    revert(@Req() req: AuthedRequest, @Body() dto: { transactionId: string }) {
        return this.stamps.revertir(dto.transactionId, req.user.id);
    }

    @Get('status/:membershipId')
    status(@Param('membershipId') membershipId: string) {
        return this.stamps.status(membershipId);
    }

    @Get('audit')
    audit(
        @Query('action') action?: string,
        @Query('membershipId') membershipId?: string,
    ) {
        return this.stamps.auditoria({ action, membershipId });
    }
}