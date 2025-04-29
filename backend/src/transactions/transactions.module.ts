import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from './transaction.entity';
import { Wallet } from '../wallets/wallet.entity';
import { UsersModule } from '../users/users.module';
import { LoggerModule } from 'logs/logger.module';

@Module({
    imports: [TypeOrmModule.forFeature([Transaction, Wallet]), UsersModule, LoggerModule],
    providers: [TransactionsService],
    controllers: [TransactionsController],
})
export class TransactionsModule { }