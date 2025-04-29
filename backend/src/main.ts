import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    const config = new DocumentBuilder()
      .setTitle('Wallet API')
      .setDescription('API para carteira financeira')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors) => {
          const messages = errors.map((error) => ({
            property: error.property,
            constraints: error.constraints,
          }));
          return new HttpException(
            { message: 'Validation failed', errors: messages },
            HttpStatus.BAD_REQUEST,
          );
        },
      }),
    );

    app.enableCors({
      origin: ['http://localhost:3001'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    });

    await app.listen(process.env.PORT ?? 3000);
    console.log(`Application is running on port ${process.env.PORT ?? 3000}`);
  } catch (error) {
    console.error('Failed to start the application:', error);
    process.exit(1);
  }
}
bootstrap();