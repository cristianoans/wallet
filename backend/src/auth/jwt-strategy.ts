import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(JwtStrategy.name);

    constructor(private configService: ConfigService) {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        if (!jwtSecret) {
            Logger.error('JWT_SECRET não está definido no arquivo .env', JwtStrategy.name);
            throw new Error('JWT_SECRET não está definido no arquivo .env');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
        });
    }

    async validate(payload: any) {
        if (!payload.sub || !payload.email) {
            this.logger.warn('Payload de JWT inválido detectado');
            throw new UnauthorizedException('Payload de JWT inválido');
        }
        return { id: payload.sub, email: payload.email };
    }
}