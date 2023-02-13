import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { MockReposetory } from 'src/common/common.type';
import { mockJWTService, mockRepo } from 'src/common/common.tools';

const mockMailService = () => ({
  sendVerificationEmail: jest.fn(),
});

describe('UsersService', () => {
  let userService: UsersService;
  let usersRepo: MockReposetory<User>;
  let verificationRepo: MockReposetory<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  const mockedEmail = 'test@example.com';

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
          useValue: mockJWTService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    usersRepo = module.get(getRepositoryToken(User));
    verificationRepo = module.get(getRepositoryToken(Verification));
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('create account', () => {
    const code = '1234';

    const createAccountArgs = {
      email: mockedEmail,
      password: '1234@abcd',
      role: UserRole.Client,
    };

    it('should fail if user exist', async () => {
      usersRepo.findOne.mockResolvedValue({ id: 1, email: mockedEmail });
      const result = await userService.createAccount(createAccountArgs);
      expect(result.ok).toBeFalsy();
    });

    it('should create a user', async () => {
      // mock user repo methods
      usersRepo.findOne.mockResolvedValue(undefined);
      usersRepo.create.mockReturnValue(createAccountArgs);

      await userService.createAccount(createAccountArgs);

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

      await userService.createAccount(createAccountArgs);

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

      await userService.createAccount(createAccountArgs);

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

      const result = await userService.createAccount(createAccountArgs);
      expect(result.ok).toBe(true);
    });

    it('should fail if there is any error', async () => {
      usersRepo.findOne.mockRejectedValue(new Error('A dummy error'));
      const result = await userService.createAccount(createAccountArgs);
      expect(result.ok).toBeFalsy();
    });
  });

  describe('login', () => {
    const credentials = { email: mockedEmail, password: '12345678' };
    const userId = 1;

    const mockedUser = {
      id: userId,
      checkPassword: jest.fn(() => Promise.resolve(false)),
    };

    it("should fail if user doesn't exist", async () => {
      usersRepo.findOne.mockResolvedValue(undefined);
      const result = await userService.login(credentials);

      expect(usersRepo.findOne).toBeCalledTimes(1);
      expect(usersRepo.findOne).toBeCalledWith({
        where: { email: credentials.email },
        select: { password: true, id: true },
      });
      expect(result.ok).toBeFalsy();
    });

    it('should fail if the password is Wrong', async () => {
      usersRepo.findOne.mockResolvedValue(mockedUser);

      const result = await userService.login(credentials);
      expect(result.ok).toBeFalsy();
    });

    it('should return JWT', async () => {
      mockedUser.checkPassword = jest.fn(() => Promise.resolve(true));
      usersRepo.findOne.mockResolvedValue(mockedUser);

      const result = await userService.login(credentials);
      expect(jwtService.sign).toBeCalledTimes(1);
      expect(jwtService.sign).toBeCalledWith({ id: userId });
      expect(result.ok).toBe(true);
    });

    it('should fail if there was an error', async () => {
      usersRepo.findOne.mockRejectedValue(new Error());
      const result = await userService.login(credentials);
      expect(result.ok).toBeFalsy();
    });
  });

  describe('findById', () => {
    const id = 5;

    it('should return undefined if user is not found', async () => {
      usersRepo.findOne.mockResolvedValue(undefined);
      const result = await userService.findById(id);
      expect(result).toBeFalsy();
    });

    it('should return a user if found', async () => {
      const mockedUser = { id, email: mockedEmail };
      usersRepo.findOne.mockResolvedValue(mockedUser);

      const result = await userService.findById(id);

      expect(usersRepo.findOne).toHaveBeenCalled();
      expect(usersRepo.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(mockedUser);
    });
  });

  describe('editProfile', () => {
    const userId = 1;
    const mockedUser = { id: 1, email: mockedEmail, verified: true };
    it('should fail if user does not exist', async () => {
      const editArgs = { email: 'newEmail@gmail.com', password: '012345678' };
      userService.findById = jest.fn(() => Promise.resolve(undefined));
      const result = await userService.editProfile(userId, editArgs);
      expect(userService.findById).toBeCalledTimes(1);
      expect(result.ok).toBeFalsy();
    });

    it('should fail if requested email is already in db', async () => {
      const editArgs = { email: 'newEmail@gmail.com', password: '012345678' };

      userService.findById = jest.fn().mockResolvedValue({ id: userId });
      usersRepo.findOne.mockResolvedValue({ id: 2 });
      const result = await userService.editProfile(userId, editArgs);

      expect(result.ok).toBe(false);
      expect(result.error).toEqual(expect.any(String));

      expect(usersRepo.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepo.findOne).toHaveBeenCalledWith({
        where: { email: editArgs.email },
      });
    });

    it(`should change user's email if there is a email in arguments 
    and send verification code for new email`, async () => {
      const editArgs = {
        email: 'newEmail@example.com',
        password: '',
      };
      const newUser = {
        id: 1,
        email: editArgs.email,
        verified: false,
      };

      const newVerification = {
        code: '1234',
      };

      userService.findById = jest.fn().mockResolvedValue(mockedUser);
      verificationRepo.create = jest.fn(() => newVerification);
      verificationRepo.save = jest.fn(() => Promise.resolve(newVerification));

      const result = await userService.editProfile(userId, editArgs);

      expect(verificationRepo.delete).toHaveBeenCalledTimes(1);
      expect(verificationRepo.delete).toHaveBeenCalledWith({
        user: {
          id: mockedUser.id,
        },
      });
      expect(verificationRepo.create).toHaveBeenCalledWith({ user: newUser });
      expect(verificationRepo.save).toHaveBeenCalledWith(newVerification);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newVerification.code,
        [editArgs.email],
      );

      expect(usersRepo.save).toHaveBeenCalledWith(newUser);
      expect(result.ok).toBe(true);
    });

    it('should change user password', async () => {
      const editArgs = {
        email: '',
        password: '123456',
      };

      const newUser = {
        ...mockedUser,
        password: editArgs.password,
      };

      userService.findById = jest.fn().mockResolvedValue(mockedUser);
      const result = await userService.editProfile(userId, editArgs);

      expect(usersRepo.save).toHaveBeenCalledWith(newUser);
      expect(result.ok).toBe(true);
    });
  });

  describe('verifyEmail', () => {
    const verificationCode = {
      code: 'code',
    };

    it('should fail on error', async () => {
      usersRepo.findOne.mockRejectedValue(new Error());
      const result = await userService.verifyEmail(verificationCode);
      expect(result.ok).toBeFalsy();
    });

    it('should fail if no verification record is found', async () => {
      usersRepo.findOne.mockResolvedValue(undefined);
      const result = await userService.verifyEmail(verificationCode);
      expect(verificationRepo.findOne).toHaveBeenCalledTimes(1);
      expect(verificationRepo.findOne).toHaveBeenCalledWith({
        where: { ...verificationCode },
        relations: { user: true },
      });
      expect(result.ok).toBeFalsy();
    });

    it('should change verified status of user to true and delete verification record', async () => {
      const verificationId = 1;
      const verification = {
        id: verificationId,
        ...verificationCode,
        user: {
          verified: false,
        },
      };

      verificationRepo.findOne.mockResolvedValue(verification);
      const result = await userService.verifyEmail(verificationCode);

      expect(usersRepo.save).toHaveBeenCalledTimes(1);
      expect(usersRepo.save).toHaveBeenCalledWith({ verified: true });

      expect(verificationRepo.delete).toHaveBeenCalledTimes(1);
      expect(verificationRepo.delete).toHaveBeenCalledWith(verificationId);
      expect(result.ok).toBe(true);
    });
  });
});
