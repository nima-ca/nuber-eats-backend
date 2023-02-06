import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';

const mockRepo = () => ({
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
});

const mockJWTService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

type MockReposetory<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let uesrService: UsersService;
  let usersRepo: MockReposetory<User>;
  let verificationRepo: MockReposetory<Verification>;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepo(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepo(),
        },
        {
          provide: JwtService,
          useValue: mockJWTService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    uesrService = module.get<UsersService>(UsersService);
    usersRepo = module.get(getRepositoryToken(User));
    verificationRepo = module.get(getRepositoryToken(Verification));
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(uesrService).toBeDefined();
  });

  describe('create account', () => {
    const createAccountArgs = {
      email: 'test@example.com',
      password: '1234@abcd',
      role: 0,
    };

    const code = '1234';

    it('should fail if user exist', async () => {
      usersRepo.findOne.mockResolvedValue({ id: 1, email: 'test@example.com' });
      const result = await uesrService.createAccount(createAccountArgs);
      expect(result.ok).toBeFalsy();
    });

    it('should create a user', async () => {
      // mock user repo methods
      usersRepo.findOne.mockResolvedValue(undefined);
      usersRepo.create.mockReturnValue(createAccountArgs);

      await uesrService.createAccount(createAccountArgs);

      // test user create method
      expect(usersRepo.create).toHaveBeenCalledTimes(1);
      expect(usersRepo.create).toHaveBeenCalledWith(createAccountArgs);

      // test user save method
      expect(usersRepo.save).toHaveBeenCalledTimes(1);
      expect(usersRepo.save).toHaveBeenCalledWith(createAccountArgs);
    });

    it('should create a verification record', async () => {
      // mock user repo methods
      usersRepo.findOne.mockResolvedValue(undefined);
      usersRepo.save.mockReturnValue(createAccountArgs);
      verificationRepo.create.mockReturnValue({ user: createAccountArgs });

      await uesrService.createAccount(createAccountArgs);

      // test verification create method
      expect(verificationRepo.create).toHaveBeenCalledTimes(1);
      expect(verificationRepo.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      // test verification save method
      expect(verificationRepo.save).toHaveBeenCalledTimes(1);
      expect(verificationRepo.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
    });

    it('should send a verification email to user', async () => {
      usersRepo.save.mockResolvedValue(createAccountArgs);
      verificationRepo.save.mockResolvedValue({ code });

      await uesrService.createAccount(createAccountArgs);

      expect(mailService.sendVerificationEmail).toBeCalledTimes(1);
      expect(mailService.sendVerificationEmail).toBeCalledWith(code, [
        createAccountArgs.email,
      ]);
    });

    it('should return { ok: true } if everything works fine', async () => {
      // mock userRepo methods
      usersRepo.findOne.mockResolvedValue(undefined);
      usersRepo.create.mockReturnValue(createAccountArgs);
      usersRepo.save.mockReturnValue(createAccountArgs);

      // mock verificationRepo methods
      verificationRepo.create.mockReturnValue({ user: createAccountArgs });
      verificationRepo.save.mockResolvedValue({ code });

      const result = await uesrService.createAccount(createAccountArgs);
      expect(result.ok).toBe(true);
    });

    it('should fail if there is any error', async () => {
      usersRepo.findOne.mockRejectedValue(new Error('A dummy error'));
      const result = await uesrService.createAccount(createAccountArgs);
      expect(result.ok).toBeFalsy();
    });
  });
});
