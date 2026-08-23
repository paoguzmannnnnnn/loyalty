import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../database/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
        private readonly jwt: JwtService,
    ) {}

    async register(dto: RegisterDto) {
        const existing = await this.users.findOne({ where: { email: dto.email } });
        if (existing) throw new ConflictException('Email ya registrado');

        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = this.users.create({
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role ?? 'customer',
        });
        await this.users.save(user);
        return this.sign(user);
    }

    async login(dto: LoginDto) {
        const user = await this.users.findOne({ where: { email: dto.email } });
        if (!user) throw new UnauthorizedException('Credenciales inválidas');

        const ok = await bcrypt.compare(dto.password, user.passwordHash);
        if (!ok) throw new UnauthorizedException('Credenciales inválidas');

        return this.sign(user);
    }

    private sign(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
        accessToken: this.jwt.sign(payload),
        user: { id: user.id,  name: user.name, email: user.email, role: user.role },
    };
    }
}