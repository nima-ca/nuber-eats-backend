import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { DishesResolver } from './dishes.resolver';
import { DishesService } from './dishes.service';
import { Dish } from './entities/dish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dish, Restaurant])],
  providers: [DishesResolver, DishesService],
})
export class DishesModule {}
