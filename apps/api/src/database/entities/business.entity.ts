import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Membership } from './membership.entity';

@Entity('businesses')
export class Business {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    // cuántos sellos se necesitan para ganar una recompensa
    @Column({ type: 'int', default: 10 })
    stampsRequired: number;

    @OneToMany(() => Membership, (m) => m.business)
    memberships: Membership[];

    @CreateDateColumn()
    createdAt: Date;
}