import {
  ObjectType,
  Field,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entities';
import { Entity, Column, BeforeInsert } from 'typeorm';
import { hash } from 'bcrypt';
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
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Column()
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @Length(8, 12)
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(() => UserRole)
  @IsNotEmpty()
  role: UserRole;

  @BeforeInsert()
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
}
