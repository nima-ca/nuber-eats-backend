import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  NOT_ALLOWED_ACTION,
  RESTAURANT_IS_NOT_FOUND,
  SUCCESSFUL_MESSAGE,
} from 'src/common/common.constants';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Repository } from 'typeorm';
import { CreateDishInput, CreateDishOutput } from './dto/create-dish.dto';
import { DeleteDishInput, DeleteDishOutput } from './dto/delete-dish.dto';
import { EditDishInput, EditDishOutput } from './dto/edit-dish.dto';
import { Dish } from './entities/dish.entity';

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

  async deleteDish(
    userId: number,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishRepo.findOne({
        where: {
          id: dishId,
        },
        relations: ['restaurant'],
      });

      if (!dish) return { ok: false, error: 'Dish is not found!' };
      if (dish.restaurant.ownerId !== userId) return NOT_ALLOWED_ACTION;

      await this.dishRepo.delete(dishId);

      return SUCCESSFUL_MESSAGE;
    } catch (error) {
      return { ok: false, error };
    }
  }

  async editDish(
    userId: number,
    { dishId, ...editDishInput }: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const dish = await this.dishRepo.findOne({
        where: {
          id: dishId,
        },
        relations: ['restaurant'],
      });

      if (!dish) return { ok: false, error: 'Dish is not found!' };
      if (dish.restaurant.ownerId !== userId) return NOT_ALLOWED_ACTION;

      await this.dishRepo.update(dishId, editDishInput);

      return SUCCESSFUL_MESSAGE;
    } catch (error) {
      return { ok: false, error };
    }
  }
}
