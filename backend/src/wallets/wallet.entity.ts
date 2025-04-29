import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/user.entity';
import { Transaction } from '../transactions/transaction.entity';

@Entity('wallets')
export class Wallet {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({ description: 'ID da carteira', example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;

    @Column({
        type: 'decimal',
        precision: 15,
        scale: 2,
        default: 0.00,
        transformer: {
            to: (value: number) => value.toFixed(2),
            from: (value: string) => parseFloat(value),
        },
    })
    @ApiProperty({ description: 'Saldo da carteira', example: 100.00 })
    balance: number;

    @CreateDateColumn()
    @ApiProperty({ description: 'Data de criação' })
    created_at: Date;

    @UpdateDateColumn()
    @ApiProperty({ description: 'Data de atualização' })
    updated_at: Date;

    @OneToOne(() => User, (user) => user.wallet)
    @JoinColumn()
    @ApiProperty({ description: 'Usuário associado à carteira', type: () => User })
    user: User;

    @OneToMany(() => Transaction, (transaction) => transaction.sender_wallet)
    @ApiProperty({ description: 'Transações enviadas', type: () => [Transaction] })
    sent_transactions: Transaction[];

    @OneToMany(() => Transaction, (transaction) => transaction.receiver_wallet)
    @ApiProperty({ description: 'Transações recebidas', type: () => [Transaction] })
    received_transactions: Transaction[];
}