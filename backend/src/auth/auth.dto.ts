import { IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @IsString()
    @ApiProperty({ description: 'Nome do usuário', example: 'John Doe' })
    name: string;

    @IsEmail()
    @ApiProperty({ description: 'E-mail do usuário', example: 'john@example.com' })
    email: string;

    @IsString()
    @MinLength(6)
    @ApiProperty({ description: 'Senha do usuário (mínimo 6 caracteres)', example: 'password123' })
    password: string;
}

export class LoginDto {
    @IsEmail()
    @ApiProperty({ description: 'E-mail do usuário', example: 'john@example.com' })
    email: string;

    @IsString()
    @ApiProperty({ description: 'Senha do usuário', example: 'password123' })
    password: string;
}