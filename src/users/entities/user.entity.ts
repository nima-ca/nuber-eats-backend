import {
  ObjectType,
  Field,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEmail, IsEnum, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entities';
import { Entity, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import { hash, compare } from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';

enum UserRole {
  Client,
  Owner,
  Delivery,
}

registerEnumType(UserRole, { name: 'userRole' });

@InputType({ isAbstract: true })
@Entity()
@ObjectType()
export class User extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsEmail()
  email: string;

  @Column()
  @Field(() => String)
  @IsString()
  @Length(8, 12)
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    try {
      this.password = await hash(this.password, 10);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'password is not hashed correctly!',
      );
    }
  }

  async checkPassword(inputPassword: string): Promise<boolean> {
    try {
      return await compare(inputPassword, this.password);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "password matching method doesn't work correctly!",
      );
    }
  }
}
