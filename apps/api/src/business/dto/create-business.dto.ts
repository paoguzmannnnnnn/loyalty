import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateBusinessDto {
    @IsString()
    @IsNotEmpty()
    name: string;

  // cuántos sellos se necesitan para la recompensa (entre 1 y 100)
    @IsInt()
    @Min(1)
    @Max(100)
    stampsRequired: number;
}