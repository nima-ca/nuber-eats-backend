import {
  InputType,
  ObjectType,
  Field,
  registerEnumType,
} from '@nestjs/graphql';
import { NULLABLE } from 'src/common/common.constants';
import { CoreEntity } from 'src/common/entities/core.entities';
import { Dish } from 'src/dishes/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  Column,
  ManyToMany,
  ManyToOne,
  JoinTable,
  RelationId,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { IsEnum, IsNumber } from 'class-validator';

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderInputType', { isAbstract: true })
@Entity()
@ObjectType()
export class Order extends CoreEntity {
  @Field(() => User, NULLABLE)
  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  customer?: User;

  @Field(() => User, NULLABLE)
  @ManyToOne(() => User, (user) => user.rides, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  driver?: User;

  @Field(() => Restaurant, NULLABLE)
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  restaurant?: Restaurant;

  @Field(() => [OrderItem])
  @ManyToMany(() => OrderItem)
  @JoinTable()
  item: OrderItem[];

  @Column(NULLABLE)
  @Field(() => Number, NULLABLE)
  @IsNumber()
  total?: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
  @Field(() => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
