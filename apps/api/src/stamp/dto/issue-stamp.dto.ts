import { IsNotEmpty, IsUUID } from 'class-validator';

export class IssueStampDto {
  // a qué tarjeta se le pica el sello
  @IsUUID()
  @IsNotEmpty()
  membershipId: string;

  // la llave anti-duplicados: si llega dos veces la misma, la segunda se rechaza
  @IsNotEmpty()
  idempotencyKey: string;
}