import { InputType, ObjectType, Field } from '@nestjs/graphql';
import { IsNumber, IsString, Length, Min } from 'class-validator';
import { NULLABLE } from 'src/common/common.constatns';
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

  @Field(() => String, NULLABLE)
  @Column(NULLABLE)
  @IsString()
  image?: string;

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

  @Field(() => [DishOptions], NULLABLE)
  @Column({ type: 'json', nullable: true })
  options?: DishOptions[];

  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menu, {
    onDelete: 'CASCADE',
  })
  restaurant: Restaurant;
}

@InputType('DishOptionsInputType', { isAbstract: true })
@ObjectType()
export class DishOptions {
  @Field(() => String)
  name: string;

  @Field(() => Number, NULLABLE)
  extra?: number;

  @Field(() => [DishChoice], NULLABLE)
  choices?: DishChoice[];
}

@InputType('DishChoiceInputType', { isAbstract: true })
@ObjectType()
export class DishChoice {
  @Field(() => String)
  name: string;

  @Field(() => Number, NULLABLE)
  extra?: number;
}
