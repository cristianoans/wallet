import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Wallet } from '../wallets/wallet.entity';

export enum TransactionType {
    DEPOSIT = 'DEPOSIT',
    TRANSFER = 'TRANSFER',
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    REVERSED = 'REVERSED',
    FAILED = 'FAILED',
}

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({ description: 'ID da transação', example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;

    @ManyToOne(() => Wallet, (wallet) => wallet.sent_transactions, { nullable: true })
    @Index()
    @ApiProperty({ description: 'Carteira remetente (null para depósitos)', type: () => Wallet, nullable: true })
    sender_wallet: Wallet;

    @ManyToOne(() => Wallet, (wallet) => wallet.received_transactions, { nullable: true })
    @Index()
    @ApiProperty({ description: 'Carteira destinatária', type: () => Wallet, nullable: true })
    receiver_wallet: Wallet;

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
    @ApiProperty({ description: 'Valor da transação', example: 100.00 })
    amount: number;

    @Column({ type: 'enum', enum: TransactionType })
    @ApiProperty({ description: 'Tipo da transação', enum: TransactionType, example: TransactionType.TRANSFER })
    type: TransactionType;

    @Column({ type: 'enum', enum: TransactionStatus })
    @ApiProperty({ description: 'Status da transação', enum: TransactionStatus, example: TransactionStatus.COMPLETED })
    status: TransactionStatus;

    @ManyToOne(() => Transaction, { nullable: true })
    @ApiProperty({ description: 'Transação revertida (se aplicável)', type: () => Transaction, nullable: true })
    reversed_transaction: Transaction;

    @CreateDateColumn()
    @ApiProperty({ description: 'Data de criação da transação' })
    created_at: Date;

    @UpdateDateColumn()
    @ApiProperty({ description: 'Data de atualização da transação' })
    updated_at: Date;
}