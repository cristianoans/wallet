import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionsService } from './transactions.service';
import { Transaction, TransactionType, TransactionStatus } from './transaction.entity';
import { Wallet } from '../wallets/wallet.entity';
import { UsersService } from '../users/users.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { LoggerService } from '../../logs/logger.service';

describe('TransactionsService', () => {
    let service: TransactionsService;
    let transactionRepository: Repository<Transaction>;
    let walletRepository: Repository<Wallet>;
    let usersService: UsersService;
    let loggerService: LoggerService;

    const mockTransactionRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findAndCount: jest.fn(),
    };

    const mockWalletRepository = {
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
    };

    const mockUsersService = {
        findByEmail: jest.fn(),
    };

    const mockLoggerService = {
        log: jest.fn(),
        error: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TransactionsService,
                { provide: getRepositoryToken(Transaction), useValue: mockTransactionRepository },
                { provide: getRepositoryToken(Wallet), useValue: mockWalletRepository },
                { provide: UsersService, useValue: mockUsersService },
                { provide: LoggerService, useValue: mockLoggerService },
            ],
        }).compile();

        service = module.get<TransactionsService>(TransactionsService);
        transactionRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
        walletRepository = module.get<Repository<Wallet>>(getRepositoryToken(Wallet));
        usersService = module.get<UsersService>(UsersService);
        loggerService = module.get<LoggerService>(LoggerService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('deposit', () => {
        const userId = 1;
        const depositDto = { amount: 100 };

        it('should deposit successfully', async () => {
            const wallet = { id: 'wallet1', balance: 0, user: { id: userId } };
            const transaction = { id: 'trans1', amount: 100, type: TransactionType.DEPOSIT, status: TransactionStatus.COMPLETED };

            mockWalletRepository.findOne.mockResolvedValue(wallet);
            mockWalletRepository.save.mockResolvedValue({ ...wallet, balance: 100 });
            mockTransactionRepository.create.mockReturnValue(transaction);
            mockTransactionRepository.save.mockResolvedValue(transaction);

            const result = await service.deposit(userId, depositDto);

            expect(mockWalletRepository.findOne).toHaveBeenCalledWith({ where: { user: { id: userId } } });
            expect(mockWalletRepository.save).toHaveBeenCalledWith({ ...wallet, balance: 100 });
            expect(mockTransactionRepository.create).toHaveBeenCalledWith({
                amount: 100,
                type: TransactionType.DEPOSIT,
                status: TransactionStatus.COMPLETED,
                receiver_wallet: wallet,
                created_at: expect.any(Date),
            });
            expect(mockTransactionRepository.save).toHaveBeenCalledWith(transaction);
            expect(loggerService.log).toHaveBeenCalledWith(`Iniciando depósito de 100 para usuário ${userId}`);
            expect(loggerService.log).toHaveBeenCalledWith(`Depósito de 100 concluído para usuário ${userId}`);
            expect(result).toEqual(transaction);
        });

        it('should throw NotFoundException if wallet is not found', async () => {
            mockWalletRepository.findOne.mockResolvedValue(null);

            await expect(service.deposit(userId, depositDto)).rejects.toThrow(NotFoundException);
            expect(loggerService.error).toHaveBeenCalledWith(`Carteira não encontrada para usuário ${userId}`);
        });
    });

    describe('transfer', () => {
        const userId = 1;
        const transferDto = { amount: 50, recipientEmail: 'jane@example.com' };

        it('should transfer successfully', async () => {
            const senderWallet = { id: 'wallet1', balance: 100, user: { id: userId } };
            const recipient = { id: 2, email: 'jane@example.com' };
            const recipientWallet = { id: 'wallet2', balance: 0, user: recipient };
            const transaction = { id: 'trans1', amount: 50, type: TransactionType.TRANSFER, status: TransactionStatus.COMPLETED };

            mockWalletRepository.findOne
                .mockResolvedValueOnce(senderWallet)
                .mockResolvedValueOnce(recipientWallet);
            mockUsersService.findByEmail.mockResolvedValue(recipient);
            mockWalletRepository.save.mockResolvedValue([senderWallet, recipientWallet]);
            mockTransactionRepository.create.mockReturnValue(transaction);
            mockTransactionRepository.save.mockResolvedValue(transaction);

            const result = await service.transfer(userId, transferDto);

            expect(mockWalletRepository.findOne).toHaveBeenCalledWith({ where: { user: { id: userId } } });
            expect(mockUsersService.findByEmail).toHaveBeenCalledWith('jane@example.com');
            expect(mockWalletRepository.findOne).toHaveBeenCalledWith({ where: { user: { id: 2 } } });
            expect(mockWalletRepository.save).toHaveBeenCalledWith([
                { ...senderWallet, balance: 50 },
                { ...recipientWallet, balance: 50 },
            ]);
            expect(mockTransactionRepository.create).toHaveBeenCalledWith({
                amount: 50,
                type: TransactionType.TRANSFER,
                status: TransactionStatus.COMPLETED,
                sender_wallet: senderWallet,
                receiver_wallet: recipientWallet,
                created_at: expect.any(Date),
            });
            expect(loggerService.log).toHaveBeenCalledWith(`Iniciando transferência de 50 de usuário ${userId} para jane@example.com`);
            expect(loggerService.log).toHaveBeenCalledWith(`Transferência de 50 concluída de usuário ${userId} para jane@example.com`);
            expect(result).toEqual(transaction);
        });

        it('should throw NotFoundException if sender wallet is not found', async () => {
            mockWalletRepository.findOne.mockResolvedValue(null);

            await expect(service.transfer(userId, transferDto)).rejects.toThrow(NotFoundException);
            expect(loggerService.error).toHaveBeenCalledWith(`Carteira remetente não encontrada para usuário ${userId}`);
        });

        it('should throw BadRequestException if transferring to the same wallet', async () => {
            const wallet = { id: 'wallet1', balance: 100, user: { id: userId } };
            const recipient = { id: userId, email: 'john@example.com' };

            mockWalletRepository.findOne.mockResolvedValue(wallet);
            mockUsersService.findByEmail.mockResolvedValue(recipient);

            await expect(service.transfer(userId, transferDto)).rejects.toThrow(BadRequestException);
            expect(loggerService.error).toHaveBeenCalledWith('Transferência para a mesma carteira não é permitida');
        });
    });

    describe('reverse', () => {
        const userId = 1;
        const reverseDto = { transactionId: 'trans1' };

        it('should reverse a transfer successfully', async () => {
            const senderWallet = { id: 'wallet1', balance: 50, user: { id: userId } };
            const receiverWallet = { id: 'wallet2', balance: 50, user: { id: 2 } };
            const transaction = {
                id: 'trans1',
                amount: 50,
                type: TransactionType.TRANSFER,
                status: TransactionStatus.COMPLETED,
                sender_wallet: senderWallet,
                receiver_wallet: receiverWallet,
                reversed_transaction: null,
            };
            const reverseTransaction = { id: 'trans2', amount: 50, type: TransactionType.TRANSFER, status: TransactionStatus.COMPLETED };

            mockTransactionRepository.findOne.mockResolvedValue(transaction);
            mockWalletRepository.save.mockResolvedValue([senderWallet, receiverWallet]);
            mockTransactionRepository.save.mockResolvedValueOnce({ ...transaction, status: TransactionStatus.REVERSED });
            mockTransactionRepository.create.mockReturnValue(reverseTransaction);
            mockTransactionRepository.save.mockResolvedValueOnce(reverseTransaction);

            const result = await service.reverse(userId, reverseDto);

            expect(mockTransactionRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'trans1' },
                relations: ['sender_wallet', 'sender_wallet.user', 'receiver_wallet', 'receiver_wallet.user'],
            });
            expect(mockWalletRepository.save).toHaveBeenCalledWith([
                { ...senderWallet, balance: 100 },
                { ...receiverWallet, balance: 0 },
            ]);
            expect(mockTransactionRepository.save).toHaveBeenCalledWith({ ...transaction, status: TransactionStatus.REVERSED });
            expect(mockTransactionRepository.create).toHaveBeenCalledWith({
                amount: 50,
                type: TransactionType.TRANSFER,
                status: TransactionStatus.COMPLETED,
                sender_wallet: receiverWallet,
                receiver_wallet: senderWallet,
                reversed_transaction: transaction,
                created_at: expect.any(Date),
            });
            expect(loggerService.log).toHaveBeenCalledWith(`Iniciando reversão da transação trans1 para usuário ${userId}`);
            expect(loggerService.log).toHaveBeenCalledWith(`Reversão da transação trans1 concluída para usuário ${userId}`);
            expect(result).toEqual(reverseTransaction);
        });

        it('should throw NotFoundException if transaction is not found', async () => {
            mockTransactionRepository.findOne.mockResolvedValue(null);

            await expect(service.reverse(userId, reverseDto)).rejects.toThrow(NotFoundException);
            expect(loggerService.error).toHaveBeenCalledWith('Transação trans1 não encontrada');
        });

        it('should throw BadRequestException if transaction is already reversed', async () => {
            const transaction = {
                id: 'trans1',
                reversed_transaction: { id: 'trans2' },
                status: TransactionStatus.COMPLETED,
            };
            mockTransactionRepository.findOne.mockResolvedValue(transaction);

            await expect(service.reverse(userId, reverseDto)).rejects.toThrow(BadRequestException);
            expect(loggerService.error).toHaveBeenCalledWith('Transação trans1 já foi revertida');
        });

        it('should throw BadRequestException if user does not have permission', async () => {
            const transaction = {
                id: 'trans1',
                status: TransactionStatus.COMPLETED,
                sender_wallet: { user: { id: 2 } },
                reversed_transaction: null,
            };
            mockTransactionRepository.findOne.mockResolvedValue(transaction);

            await expect(service.reverse(userId, reverseDto)).rejects.toThrow(BadRequestException);
            expect(loggerService.error).toHaveBeenCalledWith(`Usuário ${userId} não tem permissão para reverter a transação trans1`);
        });
    });

    describe('findByUser', () => {
        it('should return paginated transactions for the user', async () => {
            const user = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                createdAt: new Date(),
                wallet: undefined as any,
            };
            const wallet = {
                id: 'wallet1',
                balance: 0,
                created_at: new Date(),
                updated_at: new Date(),
                user: user,
                sent_transactions: [],
                received_transactions: [],
            };
            user.wallet = wallet;

            const user2 = {
                id: 2,
                name: 'Jane Doe',
                email: 'jane@example.com',
                password: 'password123',
                createdAt: new Date(),
                wallet: undefined as any,
            };
            const wallet2 = {
                id: 'wallet2',
                balance: 0,
                created_at: new Date(),
                updated_at: new Date(),
                user: user2,
                sent_transactions: [],
                received_transactions: [],
            };
            user2.wallet = wallet2;

            const transactions = [
                {
                    id: 'trans1',
                    amount: 100,
                    type: TransactionType.DEPOSIT,
                    status: TransactionStatus.COMPLETED,
                    receiver_wallet: wallet,
                    sender_wallet: null,
                    reversed_transaction: null,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: 'trans2',
                    amount: 50,
                    type: TransactionType.TRANSFER,
                    status: TransactionStatus.COMPLETED,
                    sender_wallet: wallet,
                    receiver_wallet: wallet2,
                    reversed_transaction: null,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ];

            const page = 1;
            const limit = 10;
            const total = 2; // Total de transações

            // Mock do findAndCount para retornar [transações, total]
            mockWalletRepository.findOne.mockResolvedValue(wallet);
            mockTransactionRepository.findAndCount.mockResolvedValue([transactions, total]);

            const result = await service.findByUser(user, { page, limit });

            expect(mockWalletRepository.findOne).toHaveBeenCalledWith({ where: { user: { id: user.id } } });
            expect(mockTransactionRepository.findAndCount).toHaveBeenCalledWith({
                where: [
                    { sender_wallet: { id: wallet.id } },
                    { receiver_wallet: { id: wallet.id } },
                ],
                relations: ['sender_wallet', 'sender_wallet.user', 'receiver_wallet', 'receiver_wallet.user', 'reversed_transaction'],
                order: { created_at: 'DESC' },
                skip: (page - 1) * limit, // 0
                take: limit, // 10
            });
            expect(loggerService.log).toHaveBeenCalledWith(`Buscando transações do usuário: ${user.email}`);
            expect(loggerService.log).toHaveBeenCalledWith(`Transações encontradas para o usuário: ${user.email}, página ${page}`);
            expect(result).toEqual({
                data: transactions,
                totalItems: total,
                currentPage: page,
                totalPages: Math.ceil(total / limit), // 1
            });
        });

        it('should return an empty paginated result if no transactions are found', async () => {
            const user = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                createdAt: new Date(),
                wallet: undefined as any,
            };
            const wallet = {
                id: 'wallet1',
                balance: 0,
                created_at: new Date(),
                updated_at: new Date(),
                user: user,
                sent_transactions: [],
                received_transactions: [],
            };
            user.wallet = wallet;

            const page = 1;
            const limit = 10;
            const total = 0; // Total de transações

            mockWalletRepository.findOne.mockResolvedValue(wallet);
            mockTransactionRepository.findAndCount.mockResolvedValue([[], total]);

            const result = await service.findByUser(user, { page, limit });

            expect(mockWalletRepository.findOne).toHaveBeenCalledWith({ where: { user: { id: user.id } } });
            expect(mockTransactionRepository.findAndCount).toHaveBeenCalledWith({
                where: [
                    { sender_wallet: { id: wallet.id } },
                    { receiver_wallet: { id: wallet.id } },
                ],
                relations: ['sender_wallet', 'sender_wallet.user', 'receiver_wallet', 'receiver_wallet.user', 'reversed_transaction'],
                order: { created_at: 'DESC' },
                skip: (page - 1) * limit, // 0
                take: limit, // 10
            });
            expect(loggerService.log).toHaveBeenCalledWith(`Buscando transações do usuário: ${user.email}`);
            expect(loggerService.log).toHaveBeenCalledWith(`Transações encontradas para o usuário: ${user.email}, página ${page}`);
            expect(result).toEqual({
                data: [],
                totalItems: total,
                currentPage: page,
                totalPages: Math.ceil(total / limit), // 0
            });
        });

        it('should throw NotFoundException if wallet is not found', async () => {
            const user = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                createdAt: new Date(),
                wallet: undefined as any,
            };

            const page = 1;
            const limit = 10;

            mockWalletRepository.findOne.mockResolvedValue(null);

            await expect(service.findByUser(user, { page, limit })).rejects.toThrow(NotFoundException);
            expect(mockWalletRepository.findOne).toHaveBeenCalledWith({ where: { user: { id: user.id } } });
            expect(loggerService.error).toHaveBeenCalledWith(`Carteira não encontrada para o usuário: ${user.email}`);
        });
    });
});