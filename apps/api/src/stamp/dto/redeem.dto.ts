import { IsNotEmpty, IsUUID } from 'class-validator';

export class RedeemDto {
    @IsUUID()
    @IsNotEmpty()
    membershipId: string;
}