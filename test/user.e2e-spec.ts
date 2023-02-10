import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Verification } from 'src/users/entities/verification.entity';
import * as JWT from 'jsonwebtoken';
import { JWT_TOKEN_NAME_IN_REQ_HEADER } from 'src/common/common.constatns';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn(),
  }),
}));

const GRAPHQL_ENDPOINT = '/graphql';

const testUser = {
  id: '',
  email: 'test@gmail.com',
  password: 'nima1324',
};

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Verification],
  synchronize: true,
});

describe('UserResolver (e2e)', () => {
  let app: INestApplication;

  // token is created in login test and shared with other tests!
  let jwtToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    // db connection to drop db later
    await dataSource.initialize();
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
    app.close();
  });

  describe('createAccount', () => {
    it('should create account', async () => {
      const response = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
          createAccount(input:{email: "${testUser.email}", password: "${testUser.password}", role: Owner })
          {
            ok
            error
          }
        }`,
        })
        .expect(200);

      expect(response.body.data.createAccount.ok).toBe(true);
    });

    it('should fail if there is a user with same email', async () => {
      const response = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
          createAccount(input:{email: "${testUser.email}", password: "${testUser.password}", role: Owner })
          {
            ok
            error
          }
        }`,
        })
        .expect(200);

      expect(response.body.data.createAccount.ok).toBe(false);
      expect(response.body.data.createAccount.error).toEqual(
        expect.any(String),
      );
    });
  });

  describe('login', () => {
    it('should fail on wrong email', async () => {
      const response = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
          login(
            input: { email: "wrongEmail@gmail.com", password: "${testUser.password}" }
          ) {
            ok
            error,  
            token
          }
        }`,
        })
        .expect(200);

      const login = response.body.data.login;
      expect(login.ok).toBe(false);
      expect(login.error).toEqual(expect.any(String));
      expect(login.token).toBe(null);
    });

    it('should fail on wrong password', async () => {
      const response = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
          login(
            input: { email: "${testUser.email}", password: "wrongpassword" }
          ) {
            ok
            error,  
            token
          }
        }`,
        })
        .expect(200);

      const login = response.body.data.login;
      expect(login.ok).toBe(false);
      expect(login.error).toEqual(expect.any(String));
      expect(login.token).toBe(null);
    });

    it('should login with correct credentials', async () => {
      const response = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
          login(
            input: { email: "${testUser.email}", password: "${testUser.password}" }
          ) {
            ok
            error,  
            token
          }
        }`,
        })
        .expect(200);

      const login = response.body.data.login;
      expect(login.ok).toBe(true);
      expect(login.error).toBe(null);
      expect(login.token).toEqual(expect.any(String));

      // share token with other tests!
      jwtToken = login.token;
      const payload = JWT.decode(jwtToken) as any;
      testUser.id = payload.id;
    });
  });

  describe('me', () => {
    it('should fail if user is not logged in', async () => {
      const response = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `{
          me{
            id
            email
          }
        }`,
        });

      const {
        body: { errors, data },
      } = response;
      expect(errors).toBeDefined();
      expect(errors[0].message).toBe('Forbidden resource');
      expect(data).toBeNull();
    });

    it('should return user object', async () => {
      const response = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set(JWT_TOKEN_NAME_IN_REQ_HEADER, jwtToken)
        .send({
          query: `{
          me{
            id
            email
          }
        }`,
        })
        .expect(200);

      const me = response.body.data.me;
      expect(me.email).toBe(testUser.email);
      expect(me.id).toBe(testUser.id);
    });
  });
});
