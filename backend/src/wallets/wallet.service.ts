import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './wallet.entity';
import { User } from '../users/user.entity';

@Injectable()
export class WalletService {
    constructor(
        @InjectRepository(Wallet)
        private walletRepository: Repository<Wallet>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async getBalance(userId: number): Promise<number> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['wallet'],
        });

        if (!user) {
            throw new UnauthorizedException('Usuário não encontrado.');
        }

        if (!user.wallet) {
            throw new NotFoundException('Carteira não encontrada para o usuário.');
        }

        return user.wallet.balance;
    }
}