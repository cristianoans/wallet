import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Wallet } from '../wallets/wallet.entity';
import { LoggerModule } from 'logs/logger.module';


@Module({
    imports: [TypeOrmModule.forFeature([User, Wallet]), LoggerModule],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }