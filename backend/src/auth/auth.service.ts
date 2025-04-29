import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto, LoginDto } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { LoggerService } from '../../logs/logger.service';

@Injectable()
export class AuthService {
    

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private logger: LoggerService,
    ) { }

    async register(createUserDto: CreateUserDto): Promise<{ access_token: string }> {
        this.logger.log(`Registrando usuário: ${createUserDto.email}`);
        const user = await this.usersService.create(createUserDto);

        if (!user) {
            this.logger.error(`Falha ao criar usuário: ${createUserDto.email}`);
            throw new InternalServerErrorException('Não foi possível criar o usuário');
        }

        const payload = { sub: user.id, email: user.email };
        this.logger.log(`Usuário registrado com sucesso: ${user.email}`);
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async login(loginDto: LoginDto): Promise<{ access_token: string }> {
        this.logger.log(`Tentativa de login: ${loginDto.email}`);
        const user = await this.usersService.findByEmail(loginDto.email);

        if (!user) {
            this.logger.error(`Falha ao logar, usuário: ${loginDto.email} não encontrado.`);
            throw new InternalServerErrorException('Usuário não econtrado.');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            this.logger.warn(`Falha de login: Credenciais inválidas para ${loginDto.email}`);
            throw new UnauthorizedException('Credenciais inválidas');
        }
        const payload = { sub: user.id, email: user.email };
        this.logger.log(`Login bem-sucedido: ${user.email}`);
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}