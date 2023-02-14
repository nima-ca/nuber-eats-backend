import { Injectable } from '@nestjs/common';
import { CreateDishInput, CreateDishOutput } from './dto/create-dish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from './entities/dish.entity';
import { Repository } from 'typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import {
  RESTAURANT_IS_NOT_FOUND,
  SUCCESSFUL_MESSAGE,
} from 'src/common/common.constatns';

@Injectable()
export class DishesService {
  constructor(
    @InjectRepository(Dish) private readonly dishRepo: Repository<Dish>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

  async createDish(
    userId: number,
    { restaurantId, ...createDishInput }: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurantRepo.findOne({
        where: {
          id: restaurantId,
          owner: {
            id: userId,
          },
        },
      });

      if (!restaurant) return RESTAURANT_IS_NOT_FOUND;

      await this.dishRepo.save(
        this.dishRepo.create({ ...createDishInput, restaurant }),
      );

      return SUCCESSFUL_MESSAGE;
    } catch (error) {
      return { ok: false, error };
    }
  }
}
