import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constatns';
import { MailModuleOptions } from './mail.interface';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  async sendEmail(
    receivers: string[],
    subject: string,
    text: string,
  ): Promise<boolean> {
    try {
      const gmailTransporter = nodemailer.createTransport({
        service: this.options.service,
        auth: {
          user: this.options.fromEmail,
          pass: this.options.pass,
        },
      });

      await gmailTransporter.sendMail({
        from: this.options.fromEmail,
        to: receivers,
        subject,
        text,
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async sendVerificationEmail(
    code: string,
    receivers: string[],
  ): Promise<boolean> {
    const subject = `Nuber Eats Verification Code!`;
    const content = `Please confirm your account: ${code}`;
    return await this.sendEmail(receivers, subject, content);
  }
}
