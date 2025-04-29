import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
    constructor(private readonly walletService: WalletService) {}

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obter o saldo da carteira do usuário logado' })
    @ApiResponse({ status: 200, description: 'Saldo retornado com sucesso.', type: Number })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    @ApiResponse({ status: 404, description: 'Carteira não encontrada.' })
    @Get('balance')
    async getBalance(@Request() req): Promise<number> {
        return this.walletService.getBalance(req.user.id);
    }
}