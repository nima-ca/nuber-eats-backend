import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from './jwt.service';
import { CONFIG_OPTIONS } from 'src/common/common.constatns';
import * as JWT from 'jsonwebtoken';

const TEST_SECRET_KEY = 'test-secret-key';
const PAYLOAD = { id: 1 };

jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => 'TOKEN'),
    verify: jest.fn(() => PAYLOAD),
  };
});

describe('JwtService', () => {
  let service: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { secretKey: TEST_SECRET_KEY },
        },
      ],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sign', () => {
    it('should return a JWT', () => {
      const token = service.sign(PAYLOAD);

      expect(typeof token).toBe('string');
      expect(JWT.sign).toHaveBeenCalledTimes(1);
      expect(JWT.sign).toHaveBeenCalledWith(PAYLOAD, TEST_SECRET_KEY);
    });
  });

  describe('verify', () => {
    it('should return decoded payload of token', () => {
      const token = service.sign(PAYLOAD);
      const decoded = service.verify(token);

      expect(decoded).toBe(PAYLOAD);
      expect(JWT.verify).toHaveBeenCalledTimes(1);
      expect(JWT.verify).toHaveBeenCalledWith(token, TEST_SECRET_KEY);
    });
  });
});
