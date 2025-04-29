import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Wallet } from '../wallets/wallet.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    @ApiProperty({ description: 'ID do usuário' })
    id: number;

    @Column()
    @ApiProperty({ description: 'Nome do usuário' })
    name: string;

    @Column({ unique: true })
    @ApiProperty({ description: 'E-mail do usuário' })
    email: string;

    @Column()
    @ApiProperty({ description: 'Senha do usuário (hash)' })
    password: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    @ApiProperty({ description: 'Data de criação' })
    createdAt: Date;

    @OneToOne(() => Wallet, (wallet) => wallet.user)
    @ApiProperty({ description: 'Carteira associada ao usuário', type: () => Wallet })
    wallet: Wallet;
}