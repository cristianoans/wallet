import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoggerService } from '../../logs/logger.service';
import { UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
    let service: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;
    let loggerService: LoggerService;

    const mockUsersService = {
        create: jest.fn(),
        findByEmail: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn(),
    };

    const mockLoggerService = {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: JwtService, useValue: mockJwtService },
                { provide: LoggerService, useValue: mockLoggerService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
        loggerService = module.get<LoggerService>(LoggerService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        const createUserDto = {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
        };

        it('should register a user successfully and return a token', async () => {
            const user = { id: 1, email: 'john@example.com' };
            const token = 'jwt-token';
            mockUsersService.create.mockResolvedValue(user);
            mockJwtService.sign.mockReturnValue(token);

            const result = await service.register(createUserDto);

            expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
            expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: 1, email: 'john@example.com' });
            expect(loggerService.log).toHaveBeenCalledWith('Registrando usuário: john@example.com');
            expect(loggerService.log).toHaveBeenCalledWith('Usuário registrado com sucesso: john@example.com');
            expect(result).toEqual({ access_token: token });
        });

        it('should throw InternalServerErrorException if user creation fails', async () => {
            mockUsersService.create.mockResolvedValue(null);

            await expect(service.register(createUserDto)).rejects.toThrow(InternalServerErrorException);
            expect(loggerService.log).toHaveBeenCalledWith('Registrando usuário: john@example.com');
            expect(loggerService.error).toHaveBeenCalledWith('Falha ao criar usuário: john@example.com');
        });
    });

    describe('login', () => {
        const loginDto = { email: 'john@example.com', password: 'password123' };

        it('should login a user successfully', async () => {
            const user = { id: 1, email: 'john@example.com', password: 'hashedPassword' };
            const token = 'jwt-token';
            mockUsersService.findByEmail.mockResolvedValue(user);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
            mockJwtService.sign.mockReturnValue(token);

            const result = await service.login(loginDto);

            expect(mockUsersService.findByEmail).toHaveBeenCalledWith('john@example.com');
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
            expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: 1, email: 'john@example.com' });
            expect(loggerService.log).toHaveBeenCalledWith('Tentativa de login: john@example.com');
            expect(loggerService.log).toHaveBeenCalledWith('Login bem-sucedido: john@example.com');
            expect(result).toEqual({ access_token: token });
        });

        it('should throw InternalServerErrorException if user is not found', async () => {
            mockUsersService.findByEmail.mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow(InternalServerErrorException);
            expect(mockUsersService.findByEmail).toHaveBeenCalledWith('john@example.com');
            expect(loggerService.log).toHaveBeenCalledWith('Tentativa de login: john@example.com');
            expect(loggerService.error).toHaveBeenCalledWith('Falha ao logar, usuário: john@example.com não encontrado.');
        });

        it('should throw UnauthorizedException if credentials are invalid', async () => {
            const user = { id: 1, email: 'john@example.com', password: 'hashedPassword' };
            mockUsersService.findByEmail.mockResolvedValue(user);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
            expect(mockUsersService.findByEmail).toHaveBeenCalledWith('john@example.com');
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
            expect(loggerService.log).toHaveBeenCalledWith('Tentativa de login: john@example.com');
            expect(loggerService.warn).toHaveBeenCalledWith('Falha de login: Credenciais inválidas para john@example.com');
        });
    });
});