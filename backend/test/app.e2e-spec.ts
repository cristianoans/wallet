import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConfigModule } from '@nestjs/config';

describe('App (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let transactionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
          isGlobal: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('AuthController', () => {
    it('POST /auth/register should register a user and return a token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'John Doe', email: 'john@example.com', password: 'password123' })
        .expect(201);

      expect(response.body.access_token).toBeDefined();
      jwtToken = response.body.access_token;
    });

    it('POST /auth/register should fail if email already exists', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'John Doe', email: 'john@example.com', password: 'password123' })
        .expect(409);
    });

    it('POST /auth/login should login a user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'john@example.com', password: 'password123' })
        .expect(201);

      expect(response.body.access_token).toBeDefined();
      jwtToken = response.body.access_token;
    });

    it('POST /auth/login should fail with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'john@example.com', password: 'wrongpassword' })
        .expect(401);
    });

    it('POST /auth/login should fail if user is not found', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'unknown@example.com', password: 'password123' })
        .expect(500);
    });
  });

  describe('TransactionsController', () => {
    it('POST /transactions/deposit should deposit successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/transactions/deposit')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ amount: 100 })
        .expect(201);

      expect(response.body.amount).toBe(100);
      expect(response.body.type).toBe('DEPOSIT');
      expect(response.body.status).toBe('COMPLETED');
    });

    it('POST /transactions/transfer should transfer successfully', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Jane Doe', email: 'jane@example.com', password: 'password123' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/transactions/transfer')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ amount: 50, recipientEmail: 'jane@example.com' })
        .expect(201);

      expect(response.body.amount).toBe(50);
      expect(response.body.type).toBe('TRANSFER');
      expect(response.body.status).toBe('COMPLETED');
      transactionId = response.body.id;
    });

    it('POST /transactions/transfer should fail if recipient does not exist', async () => {
      await request(app.getHttpServer())
        .post('/transactions/transfer')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ amount: 50, recipientEmail: 'unknown@example.com' })
        .expect(404);
    });

    it('POST /transactions/reverse should reverse a transaction successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/transactions/reverse')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ transactionId })
        .expect(201);

      expect(response.body.status).toBe('COMPLETED');
      expect(response.body.reversed_transaction.id).toBe(transactionId);
    });

    it('POST /transactions/reverse should fail if transaction is already reversed', async () => {
      await request(app.getHttpServer())
        .post('/transactions/reverse')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ transactionId })
        .expect(400);
    });

    it('GET /transactions should return transactions for the authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(3);


      const depositTransaction = response.body.find(
        (tx: any) => tx.type === 'DEPOSIT'
      );
      expect(depositTransaction).toBeDefined();
      expect(depositTransaction.amount).toBe(100);
      expect(depositTransaction.status).toBe('COMPLETED');
      expect(depositTransaction.receiver_wallet.user.email).toBe('john@example.com');
      expect(depositTransaction.sender_wallet).toBeNull();

      const transferTransaction = response.body.find(
        (tx: any) => tx.type === 'TRANSFER' && tx.reversed_transaction === null && tx.status === 'REVERSED'
      );
      expect(transferTransaction).toBeDefined();
      expect(transferTransaction.amount).toBe(50);
      expect(transferTransaction.status).toBe('REVERSED');
      expect(transferTransaction.sender_wallet.user.email).toBe('john@example.com');
      expect(transferTransaction.receiver_wallet.user.email).toBe('jane@example.com');

      const reverseTransaction = response.body.find(
        (tx: any) => tx.type === 'TRANSFER' && tx.reversed_transaction !== null
      );
      expect(reverseTransaction).toBeDefined();
      expect(reverseTransaction.amount).toBe(50);
      expect(reverseTransaction.status).toBe('COMPLETED');
      expect(reverseTransaction.sender_wallet.user.email).toBe('jane@example.com');
      expect(reverseTransaction.receiver_wallet.user.email).toBe('john@example.com');
      expect(reverseTransaction.reversed_transaction.id).toBe(transferTransaction.id);
    });
  });
});