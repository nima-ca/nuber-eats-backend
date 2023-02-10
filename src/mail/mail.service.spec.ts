import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { CONFIG_OPTIONS } from 'src/common/common.constatns';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn(),
  }),
}));

describe('MailService', () => {
  let service: MailService;

  const PASSWORD = 'dummy-password';
  const SERVICE = 'hotmail';
  const FROMEMAIL = 'dommyEmail@gmail.com';

  const RECEIVERS = ['test@email.com'];
  const SUBJECT = 'NOT SPECIFIED';
  const TEXT = 'dummy text';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            pass: PASSWORD,
            service: SERVICE,
            fromEmail: FROMEMAIL,
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should send email', async () => {
      const code = '1324';

      service.sendEmail = jest.fn();
      await service.sendVerificationEmail(code, RECEIVERS);

      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        RECEIVERS,
        'Nuber Eats Verification Code!',
        `Please confirm your account: ${code}`,
      );
    });
  });

  describe('sendEmail', () => {
    it('should send email', async () => {
      const result = await service.sendEmail(RECEIVERS, SUBJECT, TEXT);

      expect(nodemailer.createTransport().sendMail).toHaveBeenCalledTimes(1);
      expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
        from: FROMEMAIL,
        to: RECEIVERS,
        subject: SUBJECT,
        text: TEXT,
      });
      expect(result).toBe(true);
    });

    it('should fail on error', async () => {
      jest.spyOn(nodemailer, 'createTransport').mockImplementation(() => {
        throw new Error('something went wrong!');
      });

      const result = await service.sendEmail(RECEIVERS, SUBJECT, TEXT);
      expect(result).toBe(false);
    });
  });
});
