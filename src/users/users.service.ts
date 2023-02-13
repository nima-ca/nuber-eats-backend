import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAccountInput, CreateAccountOutput } from './dto/create-user.dto';
import { LoginInput, LoginOutput } from './dto/Login.dto';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dto/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import {
  EmailVerificationInput,
  EmailVerificationOutput,
} from './dto/email-verification.dto';
import { MailService } from 'src/mail/mail.service';
import { SUCCESSFUL_MESSAGE } from 'src/common/common.constatns';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Verification)
    private readonly verificationRepo: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const userExists = await this.userRepo.findOne({ where: { email } });
      if (userExists)
        return { ok: false, error: 'User Exist with Same Email Address!' };

      // create user
      const user = await this.userRepo.save(
        this.userRepo.create({ email, password, role }),
      );

      // create verification code
      const verification = await this.verificationRepo.save(
        this.verificationRepo.create({ user }),
      );

      this.mailService.sendVerificationEmail(verification.code, [user.email]);
      return SUCCESSFUL_MESSAGE;
    } catch (error) {
      return { ok: false, error };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.userRepo.findOne({
        where: { email },
        select: { password: true, id: true },
      });
      if (!user)
        return { ok: false, error: 'Email or Password is not correct!' };

      if (!(await user.checkPassword(password)))
        return { ok: false, error: 'Email or Password is not correct!' };

      return {
        ok: true,
        token: this.jwtService.sign({ id: user.id }),
      };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.findById(userId);
      if (!user) return { ok: false, error: 'User not found!' };

      if (email) {
        const userWithRequestedEmail = await this.userRepo.findOne({
          where: { email },
        });

        if (userWithRequestedEmail)
          return { ok: false, error: 'email is already registered!' };

        user.email = email;
        user.verified = false;
        await this.verificationRepo.delete({
          user: {
            id: user.id,
          },
        });
        const verification = await this.verificationRepo.save(
          this.verificationRepo.create({ user }),
        );
        this.mailService.sendVerificationEmail(verification.code, [user.email]);
      }

      if (password) user.password = password;

      await this.userRepo.save(user);
      return SUCCESSFUL_MESSAGE;
    } catch (error) {
      return { ok: false, error };
    }
  }

  async verifyEmail({
    code,
  }: EmailVerificationInput): Promise<EmailVerificationOutput> {
    try {
      const verification = await this.verificationRepo.findOne({
        where: { code },
        relations: { user: true },
      });
      if (!verification) return { ok: false, error: 'The code is wrong!' };

      // change user verified status
      verification.user.verified = true;
      await this.userRepo.save(verification.user);

      // delete verification record
      await this.verificationRepo.delete(verification.id);
      return SUCCESSFUL_MESSAGE;
    } catch (error) {
      return { ok: false, error };
    }
  }

  async findById(id: number): Promise<User> {
    return this.userRepo.findOne({ where: { id } });
  }
}
