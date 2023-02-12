import { createMock } from '@golevelup/ts-jest';
import {
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { AllowedRoles } from 'src/common/common.type';
import { ROLE_METADATA_KEY } from 'src/common/common.constatns';

const mockReflector = () => ({
  get: jest.fn((metadataKey: string, target: Function): AllowedRoles[] => []),
});

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: Reflector,
          useValue: mockReflector(),
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true without metadata for public resolvers', () => {
    const context = createMock<ExecutionContext>();
    reflector.get = jest.fn().mockReturnValue(undefined);

    expect(guard.canActivate(context)).toBeTruthy();
    expect(reflector.get).toHaveBeenCalledTimes(1);
    expect(reflector.get).toHaveBeenCalledWith(
      ROLE_METADATA_KEY,
      context.getHandler(),
    );
  });

  it('should fail if there is a metadata but no user in request', () => {
    const context = createMock<ExecutionContext>();
    reflector.get = jest.fn().mockReturnValue(['Any']);
    guard.getUser = jest.fn().mockReturnValue(undefined);

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should pass if there is a ["Any"] user role', () => {
    const context = createMock<ExecutionContext>();
    reflector.get = jest.fn().mockReturnValue(['Any']);
    guard.getUser = jest.fn().mockReturnValue({ id: 1 });

    expect(guard.canActivate(context)).toBeTruthy();
  });

  it('should fail on wrong user role', () => {
    const context = createMock<ExecutionContext>();
    reflector.get = jest.fn().mockReturnValue(['Owner']);
    guard.getUser = jest.fn().mockReturnValue({ id: 1, role: 'Client' });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should pass if the user role and metadata matches', () => {
    const context = createMock<ExecutionContext>();
    reflector.get = jest.fn().mockReturnValue(['Owner']);
    guard.getUser = jest.fn().mockReturnValue({ id: 1, role: 'Owner' });

    expect(guard.canActivate(context)).toBeTruthy();
  });
});
