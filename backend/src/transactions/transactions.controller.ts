import { Controller, Post, Body, Request, UseGuards, HttpCode, Get, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { DepositDto, TransferDto, ReverseTransactionDto } from './transactions.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
    constructor(private transactionsService: TransactionsService) {}

    @Post('deposit')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 201, description: 'Depósito realizado com sucesso' })
    @ApiResponse({ status: 404, description: 'Carteira não encontrada' })
    @ApiBody({ type: DepositDto })
    async deposit(@Body() depositDto: DepositDto, @Request() req) {
        return this.transactionsService.deposit(req.user.id, depositDto);
    }

    @Post('transfer')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 201, description: 'Transferência realizada com sucesso' })
    @ApiResponse({ status: 404, description: 'Carteira não encontrada' })
    @ApiResponse({ status: 400, description: 'Requisição inválida' })
    @ApiBody({ type: TransferDto })
    async transfer(@Body() transferDto: TransferDto, @Request() req) {
        return this.transactionsService.transfer(req.user.id, transferDto);
    }

    @Post('reverse')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(201)
    @ApiResponse({ status: 201, description: 'Reversão realizada com sucesso' })
    @ApiResponse({ status: 404, description: 'Transação não encontrada' })
    @ApiResponse({ status: 400, description: 'Requisição inválida' })
    @ApiBody({ type: ReverseTransactionDto })
    async reverse(@Body() reverseDto: ReverseTransactionDto, @Request() req) {
        return this.transactionsService.reverse(req.user.id, reverseDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página', example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Quantidade de itens por página', example: 10 })
    @ApiResponse({
        status: 200,
        description: 'Lista paginada de transações',
        schema: {
            example: {
                data: [
                    {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        type: 'DEPOSIT',
                        amount: 100.00,
                        status: 'COMPLETED',
                        sender_wallet: null,
                        receiver_wallet: { id: '...', user: { id: 1, email: 'user@example.com' } },
                        reversed_transaction: null,
                        created_at: '2025-04-28T12:00:00.000Z',
                        updated_at: '2025-04-28T12:00:00.000Z',
                    }
                ],
                totalItems: 18,
                currentPage: 1,
                totalPages: 2
            }
        }
    })
    async getTransactions(
        @Request() req,
        @Query('page') page = 1,
        @Query('limit') limit = 10,
    ) {
        return this.transactionsService.findByUser(req.user, { page: Number(page), limit: Number(limit) });
    }
}