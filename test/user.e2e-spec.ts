import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule, entities } from './../src/app.module';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Verification } from 'src/users/entities/verification.entity';
import * as JWT from 'jsonwebtoken';
import { JWT_TOKEN_NAME_IN_REQ_HEADER } from 'src/common/common.constatns';
import { getRepositoryToken } from '@nestjs/typeorm';

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
  entities,
  synchronize: true,
});

describe('UserResolver (e2e)', () => {
  let app: INestApplication;
  let verificationRepo: Repository<Verification>;

  // token is created in login test and shared with other tests!
  let jwtToken: string;

  const baseRequest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicRequest = (query: string) => baseRequest().send({ query });
  const privateRequest = (query: string) =>
    baseRequest().set(JWT_TOKEN_NAME_IN_REQ_HEADER, jwtToken).send({ query });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    verificationRepo = module.get<Repository<Verification>>(
      getRepositoryToken(Verification),
    );

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
      const response = await publicRequest(`mutation {
        createAccount(input:{email: "${testUser.email}", password: "${testUser.password}", role: Owner })
        {
          ok
          error
        }
      }`).expect(200);
      expect(response.body.data.createAccount.ok).toBe(true);
    });

    it('should fail if there is a user with same email', async () => {
      const response = await publicRequest(`mutation {
        createAccount(input:{email: "${testUser.email}", password: "${testUser.password}", role: Owner })
        {
          ok
          error
        }
      }`).expect(200);

      expect(response.body.data.createAccount.ok).toBe(false);
      expect(response.body.data.createAccount.error).toEqual(
        expect.any(String),
      );
    });
  });

  describe('login', () => {
    it('should fail on wrong email', async () => {
      const response = await publicRequest(`mutation {
        login(
          input: { email: "wrongEmail@gmail.com", password: "${testUser.password}" }
        ) {
          ok
          error,  
          token
        }
      }`).expect(200);

      const login = response.body.data.login;
      expect(login.ok).toBe(false);
      expect(login.error).toEqual(expect.any(String));
      expect(login.token).toBe(null);
    });

    it('should fail on wrong password', async () => {
      const response = await publicRequest(`mutation {
        login(
          input: { email: "${testUser.email}", password: "wrongpassword" }
        ) {
          ok
          error,  
          token
        }
      }`).expect(200);

      const login = response.body.data.login;
      expect(login.ok).toBe(false);
      expect(login.error).toEqual(expect.any(String));
      expect(login.token).toBe(null);
    });

    it('should login with correct credentials', async () => {
      const response = await publicRequest(`mutation {
        login(
          input: { email: "${testUser.email}", password: "${testUser.password}" }
        ) {
          ok
          error,  
          token
        }
      }`).expect(200);

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
      const response = await publicRequest(`{
        me{
          id
          email
        }
      }`).expect(200);

      const {
        body: { errors, data },
      } = response;
      expect(errors).toBeDefined();
      expect(errors[0].message).toEqual(expect.any(String));
      expect(data).toBeNull();
    });

    it('should return user object', async () => {
      const response = await privateRequest(`{
        me{
          id
          email
        }
      }`).expect(200);

      const me = response.body.data.me;
      expect(me.email).toBe(testUser.email);
      expect(me.id).toBe(testUser.id);
    });
  });

  describe('editProfile', () => {
    const DUMMY_EMAIL = 'dummyEmail@test.com';
    it('should change email', async () => {
      const response = await privateRequest(`mutation {
        editProfile(input:{
          email: "${DUMMY_EMAIL}",
        }){
          ok
          error
        }
      }`).expect(200);

      const {
        body: {
          data: {
            editProfile: { ok, error },
          },
        },
      } = response;

      expect(ok).toBe(true);
      expect(error).toBeNull();
    });

    it('email should have been changed', async () => {
      await privateRequest(`{
        me{
          email
        }
      }`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.me.email).toBe(DUMMY_EMAIL);
        });
    });

    it('should fail if user is not logged in', async () => {
      const response = await publicRequest(`mutation {
        editProfile(input:{
          email: "${DUMMY_EMAIL}",
        }){
          ok
          error
        }
      }`).expect(200);

      const {
        body: { errors, data },
      } = response;
      expect(errors).toBeDefined();
      expect(errors[0].message).toEqual(expect.any(String));
      expect(data).toBeNull();
    });
  });

  describe('verifyEmail', () => {
    let verificationCode: string;
    beforeEach(async () => {
      const [verification] = await verificationRepo.find();
      verificationCode = verification?.code;
    });

    it('should fail on wrong verification code', async () => {
      await publicRequest(`mutation {
        verifyEmail(input: { code: "wrong verification code" }) {
          ok
          error
        }
      }`)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;

          expect(ok).toBe(false);
          expect(error).toEqual(expect.any(String));
        });
    });

    it('should verify user', async () => {
      await publicRequest(`mutation {
        verifyEmail(input: { code: "${verificationCode}" }) {
          ok
          error
        }
      }`)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;

          expect(ok).toBe(true);
          expect(error).toBeNull();
        });
    });
  });
});
