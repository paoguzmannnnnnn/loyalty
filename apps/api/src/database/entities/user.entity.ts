import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Membership } from './membership.entity';

export type UserRole = 'customer' | 'business';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ default: '' })
    name: string;

    @Column()
    passwordHash: string;

    @Column({ type: 'varchar', default: 'customer' })
    role: UserRole;

    @OneToMany(() => Membership, (m) => m.user)
    memberships: Membership[];

    @CreateDateColumn()
    createdAt: Date;
}