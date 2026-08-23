import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Membership } from './membership.entity';

@Entity('stamp_transactions')
export class StampTransaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Membership, (m) => m.transactions, { onDelete: 'CASCADE' })
    membership: Membership;

    // +1 al ganar un sello, negativo al canjear una recompensa
    @Column({ type: 'int' })
    delta: number;

    // clave única que impide duplicar un sello (idempotencia)
    @Column({ unique: true })
    idempotencyKey: string;

    @CreateDateColumn()
    createdAt: Date;
}