import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dto/create-user.input';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    try {
      const userExists = await this.userRepo.findOne({
        where: {
          email,
        },
      });
      if (userExists)
        return { ok: false, error: 'User Exist with Same Email Address!' };
      await this.userRepo.save(this.userRepo.create({ email, password, role }));
      return { ok: true };
    } catch (error) {
      console.log(error);
      return { ok: false, error: "Couldn't create Account!" };
    }
  }

  findAll() {}

  findOne(id: number) {}

  // update(id: number, updateUserInput: UpdateUserInput) {}

  remove(id: number) {}
}
