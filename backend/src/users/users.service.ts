import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Wallet } from '../wallets/wallet.entity';
import { CreateUserDto } from '../auth/auth.dto';
import { LoggerService } from '../../logs/logger.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Wallet)
        private walletsRepository: Repository<Wallet>,
        private logger: LoggerService,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { name, email, password } = createUserDto;

        this.logger.log(`Iniciando criação de usuário: ${email}`);

        const existingUser = await this.usersRepository.findOne({ where: { email } });
        if (existingUser) {
            this.logger.error(`E-mail já registrado: ${email}`);
            throw new ConflictException('E-mail já registrado');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({ name, email, password: hashedPassword });
        const savedUser = await this.usersRepository.save(user);

        // Criar carteira automaticamente para o usuário
        const wallet = this.walletsRepository.create({ balance: 0, user: savedUser });
        await this.walletsRepository.save(wallet);

        this.logger.log(`Usuário criado com sucesso: ${email}, com carteira ID: ${wallet.id}`);
        return savedUser;
    }

    async findByEmail(email: string): Promise<User> {
        this.logger.log(`Buscando usuário por e-mail: ${email}`);

        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) {
            this.logger.error(`Usuário não encontrado: ${email}`);
            throw new NotFoundException('Usuário não encontrado');
        }

        this.logger.log(`Usuário encontrado: ${email}`);
        return user;
    }
}