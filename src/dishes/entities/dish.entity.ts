import { InputType, ObjectType, Field } from '@nestjs/graphql';
import { IsNumber, IsString, Length, Min } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entities';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Entity, Column, ManyToOne } from 'typeorm';

@InputType('DishInputType', { isAbstract: true })
@Entity()
@ObjectType()
export class Dish extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  image: string;

  @Field(() => Number)
  @Column()
  @IsNumber()
  @Min(0)
  price: number;

  @Field(() => String)
  @Column()
  @IsString()
  @Length(5, 200)
  description: string;

  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menu, {
    onDelete: 'CASCADE',
  })
  restaurant: Restaurant;
}
