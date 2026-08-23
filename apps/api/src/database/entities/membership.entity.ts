import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Business } from './business.entity';
import { StampTransaction } from './stamp-transaction.entity';

@Entity('memberships')
@Unique(['user', 'business']) // un usuario solo tiene UNA tarjeta por negocio
export class Membership {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (u) => u.memberships, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Business, (b) => b.memberships, { onDelete: 'CASCADE' })
    business: Business;

    // saldo actual de sellos
    @Column({ type: 'int', default: 0 })
    stampBalance: number;

    // recompensas ganadas que aún no se han canjeado
    @Column({ type: 'int', default: 0 })
    rewardsAvailable: number;

    @OneToMany(() => StampTransaction, (t) => t.membership)
    transactions: StampTransaction[];

    @CreateDateColumn()
    createdAt: Date;
}