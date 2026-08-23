import { IsNotEmpty, IsUUID } from 'class-validator';

export class JoinBusinessDto {
    @IsUUID()
    @IsNotEmpty()
    businessId: string;
}