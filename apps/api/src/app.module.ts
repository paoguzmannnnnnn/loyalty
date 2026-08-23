import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Business } from './database/entities/business.entity';
import { User } from './database/entities/user.entity';
import { Membership } from './database/entities/membership.entity';
import { StampTransaction } from './database/entities/stamp-transaction.entity';
import { AuthModule } from './auth/auth.module';
import { BusinessModule } from './business/business.module';
import { MembershipModule } from './membership/membership.module';
import { StampModule } from './stamp/stamp.module';
import { AuditLog } from './database/entities/audit-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [Business, User, Membership, StampTransaction, AuditLog],
        synchronize: true, // SOLO en desarrollo: crea/actualiza tablas solo
        ssl:
          process.env.NODE_ENV === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }), AuthModule, BusinessModule, MembershipModule, StampModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}