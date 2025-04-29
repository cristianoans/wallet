import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from './auth.dto';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    @HttpCode(201)
    @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso' })
    @ApiResponse({ status: 409, description: 'E-mail já registrado' })
    @ApiBody({ type: CreateUserDto })
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    @Post('login')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Login bem-sucedido' })
    @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
    @ApiBody({ type: LoginDto })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
}