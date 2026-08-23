import { IsEmail, IsIn, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class RegisterDto {

    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @MinLength(8)
    password: string;

    @IsOptional()
    @IsIn(['customer', 'business'])
    role?: 'customer' | 'business';
}