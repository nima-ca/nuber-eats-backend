import { Test, TestingModule } from '@nestjs/testing';
import { JwtMiddleware } from './jwt.middleware';
import { JwtService } from './jwt.service';
import { mockJWTService } from 'src/common/common.tools';
import { UsersService } from 'src/users/users.service';
import { NextFunction, Request, Response } from 'express';
import { JWT_TOKEN_NAME_IN_REQ_HEADER } from 'src/common/common.constatns';
const mockUsersService = () => ({
  findById: jest.fn(),
});

jest.mock('express');

describe('JWT Middleware', () => {
  let middleware: JwtMiddleware;
  let jwtService: JwtService;
  let usersService: UsersService;

  const mockedRequest = {
    headers: {
      'xsrf-token': 'random token',
    },
  } as any as Request;
  const mockedResponse = {} as Response;
  const mockedNextFunction = jest.fn();
  const userIdInPayload = 1;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtMiddleware,
        {
          provide: JwtService,
          useValue: mockJWTService(),
        },
        {
          provide: UsersService,
          useValue: mockUsersService(),
        },
      ],
    }).compile();

    middleware = module.get<JwtMiddleware>(JwtMiddleware);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('use', () => {
    it('should add user object to request if there was a valid token', () => {
      middleware.verifyToken = jest.fn().mockReturnValue({ id: 1 });
      usersService.findById = jest
        .fn()
        .mockResolvedValue({ id: userIdInPayload });

      middleware.use(mockedRequest, mockedResponse, mockedNextFunction);

      expect(middleware.verifyToken).toHaveBeenCalledTimes(1);
      expect(middleware.verifyToken).toHaveBeenCalledWith(mockedRequest);

      expect(usersService.findById).toHaveBeenCalledTimes(1);
      expect(usersService.findById).toHaveBeenCalledWith(userIdInPayload);
    });
  });

  describe('verifyToken', () => {
    const payload = { id: userIdInPayload };
    it('should verify and return payload if there is a token in header', () => {
      jwtService.verify = jest.fn().mockReturnValue(payload);

      const result = middleware.verifyToken(mockedRequest);
      expect(result).toEqual(payload);
    });

    it('should return undefined if there is no token in header', () => {
      const mockedUserWithoutToken = { headers: {} } as Request;
      const result = middleware.verifyToken(mockedUserWithoutToken);
      expect(result).toBeUndefined();
    });
  });
});
