import { IsNumber, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transaction } from './transaction.entity';

export class DepositDto {
    @IsNumber()
    @IsPositive()
    @ApiProperty({ description: 'Valor do depósito', example: 100.00 })
    amount: number;
}

export class TransferDto {
    @IsNumber()
    @IsPositive()
    @ApiProperty({ description: 'Valor da transferência', example: 50.00 })
    amount: number;

    @IsString()
    @ApiProperty({ description: 'E-mail do destinatário', example: 'jane@example.com' })
    recipientEmail: string;
}

export class ReverseTransactionDto {
    @IsString()
    @ApiProperty({ description: 'ID da transação a ser revertida', example: '123e4567-e89b-12d3-a456-426614174000' })
    transactionId: string;
}

export class PaginatedTransactionsResultDto {
    @ApiProperty({ type: [Transaction] })
    data: Transaction[];

    @ApiProperty({ example: 18 })
    totalItems: number;

    @ApiProperty({ example: 1 })
    currentPage: number;

    @ApiProperty({ example: 2 })
    totalPages: number;
}