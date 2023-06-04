import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { compare, hash } from 'bcrypt';
import { IsBoolean, IsEmail, IsEnum, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entities';
import { Order } from 'src/orders/entities/order.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';

export enum UserRole {
  Client = 'Client',
  Owner = 'Owner',
  Delivery = 'Delivery',
}

registerEnumType(UserRole, { name: 'userRole' });

@InputType('UserInputType', { isAbstract: true })
@Entity()
@ObjectType()
export class User extends CoreEntity {
  @Column({ unique: true })
  @Field(() => String)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Field(() => String)
  @IsString()
  @Length(8, 12)
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field(() => Boolean)
  @IsBoolean()
  verified: boolean;

  @Field(() => [Restaurant])
  @OneToMany(() => Restaurant, (restaurant) => restaurant.owner)
  restaurants: Restaurant[];

  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.customer)
  rides: Order[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) this.password = await hash(this.password, 10);
  }

  async checkPassword(inputPassword: string): Promise<boolean> {
    return await compare(inputPassword, this.password);
  }
}
