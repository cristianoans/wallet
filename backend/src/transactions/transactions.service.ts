import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from './transaction.entity';
import { Wallet } from '../wallets/wallet.entity';
import { UsersService } from '../users/users.service';
import { DepositDto, TransferDto, ReverseTransactionDto } from './transactions.dto';
import { LoggerService } from '../../logs/logger.service';
import { User } from 'src/users/user.entity';

@Injectable()
export class TransactionsService {

    constructor(
        @InjectRepository(Transaction)
        private transactionsRepository: Repository<Transaction>,
        @InjectRepository(Wallet)
        private walletsRepository: Repository<Wallet>,
        private usersService: UsersService,
        private logger: LoggerService,
    ) { }

    async deposit(userId: number, depositDto: DepositDto): Promise<Transaction> {
        this.logger.log(`Iniciando depósito de ${depositDto.amount} para usuário ${userId}`);

        const wallet = await this.walletsRepository.findOne({ where: { user: { id: userId } } });
        if (!wallet) {
            this.logger.error(`Carteira não encontrada para usuário ${userId}`);
            throw new NotFoundException('Carteira não encontrada');
        }

        wallet.balance += depositDto.amount;
        await this.walletsRepository.save(wallet);

        const transaction = this.transactionsRepository.create({
            amount: depositDto.amount,
            type: TransactionType.DEPOSIT,
            status: TransactionStatus.COMPLETED,
            receiver_wallet: wallet,
            created_at: new Date(),
        });

        const savedTransaction = await this.transactionsRepository.save(transaction);
        this.logger.log(`Depósito de ${depositDto.amount} concluído para usuário ${userId}`);
        return savedTransaction;
    }

    async transfer(userId: number, transferDto: TransferDto): Promise<Transaction> {
        this.logger.log(`Iniciando transferência de ${transferDto.amount} de usuário ${userId} para ${transferDto.recipientEmail}`);

        const senderWallet = await this.walletsRepository.findOne({ where: { user: { id: userId } } });
        if (!senderWallet) {
            this.logger.error(`Carteira remetente não encontrada para usuário ${userId}`);
            throw new NotFoundException('Carteira remetente não encontrada');
        }

        const recipient = await this.usersService.findByEmail(transferDto.recipientEmail);
        const recipientWallet = await this.walletsRepository.findOne({ where: { user: { id: recipient.id } } });
        if (!recipientWallet) {
            this.logger.error(`Carteira destinatária não encontrada para ${transferDto.recipientEmail}`);
            throw new NotFoundException('Carteira destinatária não encontrada');
        }

        if (senderWallet.id === recipientWallet.id) {
            this.logger.error(`Transferência para a mesma carteira não é permitida`);
            throw new BadRequestException('Não é possível transferir para a mesma carteira');
        }

        senderWallet.balance -= transferDto.amount;
        recipientWallet.balance += transferDto.amount;
        await this.walletsRepository.save([senderWallet, recipientWallet]);

        const transaction = this.transactionsRepository.create({
            amount: transferDto.amount,
            type: TransactionType.TRANSFER,
            status: TransactionStatus.COMPLETED,
            sender_wallet: senderWallet,
            receiver_wallet: recipientWallet,
            created_at: new Date(),
        });

        const savedTransaction = await this.transactionsRepository.save(transaction);
        this.logger.log(`Transferência de ${transferDto.amount} concluída de usuário ${userId} para ${transferDto.recipientEmail}`);
        return savedTransaction;
    }

    async reverse(userId: number, reverseDto: ReverseTransactionDto): Promise<Transaction> {
        this.logger.log(`Iniciando reversão da transação ${reverseDto.transactionId} para usuário ${userId}`);

        const transaction = await this.transactionsRepository.findOne({
            where: { id: reverseDto.transactionId },
            relations: ['sender_wallet', 'sender_wallet.user', 'receiver_wallet', 'receiver_wallet.user'],
        });

        if (!transaction) {
            this.logger.error(`Transação ${reverseDto.transactionId} não encontrada`);
            throw new NotFoundException('Transação não encontrada');
        }

        if (transaction.status !== TransactionStatus.COMPLETED) {
            this.logger.error(`Transação ${reverseDto.transactionId} não pode ser revertida (status: ${transaction.status})`);
            throw new BadRequestException('Apenas transações concluídas podem ser revertidas');
        }

        if (transaction.sender_wallet && transaction.sender_wallet.user?.id !== userId) {
            this.logger.error(`Usuário ${userId} não tem permissão para reverter a transação ${reverseDto.transactionId}`);
            throw new BadRequestException('Você não tem permissão para reverter esta transação');
        }

        if (transaction.reversed_transaction) {
            this.logger.error(`Transação ${reverseDto.transactionId} já foi revertida`);
            throw new BadRequestException('Transação já foi revertida');
        }

        if (transaction.type === TransactionType.DEPOSIT) {
            if (!transaction.receiver_wallet) {
                this.logger.error(`Depósito ${reverseDto.transactionId} inválido: carteira destinatária ausente`);
                throw new BadRequestException('Depósito inválido');
            }
            transaction.receiver_wallet.balance -= transaction.amount;
            await this.walletsRepository.save(transaction.receiver_wallet);
        } else if (transaction.type === TransactionType.TRANSFER) {
            if (!transaction.sender_wallet || !transaction.receiver_wallet) {
                this.logger.error(`Transferência ${reverseDto.transactionId} inválida: carteiras ausentes`);
                throw new BadRequestException('Transferência inválida');
            }
            transaction.sender_wallet.balance += transaction.amount;
            transaction.receiver_wallet.balance -= transaction.amount;
            await this.walletsRepository.save([transaction.sender_wallet, transaction.receiver_wallet]);
        }

        transaction.status = TransactionStatus.REVERSED;
        await this.transactionsRepository.save(transaction);

        const reverseTransaction = this.transactionsRepository.create({
            amount: transaction.amount,
            type: transaction.type,
            status: TransactionStatus.COMPLETED,
            sender_wallet: transaction.receiver_wallet,
            receiver_wallet: transaction.sender_wallet,
            reversed_transaction: transaction,
            created_at: new Date(),
        });

        const savedReverseTransaction = await this.transactionsRepository.save(reverseTransaction);
        this.logger.log(`Reversão da transação ${reverseDto.transactionId} concluída para usuário ${userId}`);
        return savedReverseTransaction;
    }

    async findByUser(user: User, options: { page: number; limit: number }) {
        this.logger.log(`Buscando transações do usuário: ${user.email}`);

        const { page, limit } = options;

        const wallet = await this.walletsRepository.findOne({
            where: { user: { id: user.id } },
        });

        if (!wallet) {
            this.logger.error(`Carteira não encontrada para o usuário: ${user.email}`);
            throw new NotFoundException('Carteira não encontrada');
        }

        const [transactions, total] = await this.transactionsRepository.findAndCount({
            where: [
                { sender_wallet: { id: wallet.id } },
                { receiver_wallet: { id: wallet.id } },
            ],
            relations: ['sender_wallet', 'sender_wallet.user', 'receiver_wallet', 'receiver_wallet.user', 'reversed_transaction'],
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        this.logger.log(`Transações encontradas para o usuário: ${user.email}, página ${page}`);

        return {
            data: transactions,
            totalItems: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
        };
    }
}