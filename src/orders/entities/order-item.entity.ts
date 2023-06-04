import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { NULLABLE } from 'src/common/common.constants';
import { CoreEntity } from 'src/common/entities/core.entities';
import { Dish } from 'src/dishes/entities/dish.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@InputType('OrderItemOptionInputType', { isAbstract: true })
@ObjectType()
export class OrderItemOption {
  @Field(() => String)
  name: string;
  @Field(() => String, NULLABLE)
  choice: String;
}

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  @Field(() => Dish)
  @ManyToOne(() => Dish, { nullable: true, onDelete: 'CASCADE' })
  dish: Dish;

  @Field(() => [OrderItemOption], NULLABLE)
  @Column({ type: 'json', nullable: true })
  options?: OrderItemOption[];
}
