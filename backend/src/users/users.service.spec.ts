import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Wallet } from '../wallets/wallet.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoggerService } from '../../logs/logger.service';

describe('UsersService', () => {
    let service: UsersService;
    let userRepository: Repository<User>;
    let walletRepository: Repository<Wallet>;
    let loggerService: LoggerService;

    const mockUserRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const mockWalletRepository = {
        create: jest.fn(),
        save: jest.fn(),
    };

    const mockLoggerService = {
        log: jest.fn(),
        error: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: getRepositoryToken(Wallet),
                    useValue: mockWalletRepository,
                },
                {
                    provide: LoggerService,
                    useValue: mockLoggerService,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        walletRepository = module.get<Repository<Wallet>>(getRepositoryToken(Wallet));
        loggerService = module.get<LoggerService>(LoggerService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        const createUserDto = {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
        };

        it('should create a user and wallet successfully', async () => {
            const hashedPassword = 'hashedPassword';
            const user = { id: 1, name: 'John Doe', email: 'john@example.com', password: hashedPassword };
            const wallet = { id: 'wallet1', balance: 0, user };

            mockUserRepository.findOne.mockResolvedValue(null);
            jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
            mockUserRepository.create.mockReturnValue(user);
            mockUserRepository.save.mockResolvedValue(user);
            mockWalletRepository.create.mockReturnValue(wallet);
            mockWalletRepository.save.mockResolvedValue(wallet);

            const result = await service.create(createUserDto);

            expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: 'john@example.com' } });
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                name: 'John Doe',
                email: 'john@example.com',
                password: hashedPassword,
            });
            expect(mockUserRepository.save).toHaveBeenCalledWith(user);
            expect(mockWalletRepository.create).toHaveBeenCalledWith({ balance: 0, user });
            expect(mockWalletRepository.save).toHaveBeenCalledWith(wallet);
            expect(loggerService.log).toHaveBeenCalledWith('Iniciando criação de usuário: john@example.com');
            expect(loggerService.log).toHaveBeenCalledWith(`Usuário criado com sucesso: john@example.com, com carteira ID: ${wallet.id}`);
            expect(result).toEqual(user);
        });

        it('should throw ConflictException if email already exists', async () => {
            const existingUser = { id: 1, email: 'john@example.com' };
            mockUserRepository.findOne.mockResolvedValue(existingUser);

            await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: 'john@example.com' } });
            expect(loggerService.error).toHaveBeenCalledWith('E-mail já registrado: john@example.com');
        });
    });

    describe('findByEmail', () => {
        it('should find a user by email successfully', async () => {
            const user = { id: 1, email: 'john@example.com' };
            mockUserRepository.findOne.mockResolvedValue(user);

            const result = await service.findByEmail('john@example.com');

            expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: 'john@example.com' } });
            expect(loggerService.log).toHaveBeenCalledWith('Buscando usuário por e-mail: john@example.com');
            expect(loggerService.log).toHaveBeenCalledWith('Usuário encontrado: john@example.com');
            expect(result).toEqual(user);
        });

        it('should throw NotFoundException if user is not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);

            await expect(service.findByEmail('john@example.com')).rejects.toThrow(NotFoundException);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: 'john@example.com' } });
            expect(loggerService.error).toHaveBeenCalledWith('Usuário não encontrado: john@example.com');
        });
    });
});