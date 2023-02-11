import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.dto';
import {
  UpdateRestaurantInput,
  UpdateRestaurantOutput,
} from './dto/update-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dto/delete-restaurant.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entitiy';
import { User } from 'src/users/entities/user.entity';
import { SUCCESSFUL_MESSAGE } from 'src/common/common.constatns';

const RESTAURANT_IS_NOT_FOUND = {
  ok: false,
  error: 'Restaurant is not found!',
};

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async createRestaurant(
    owner: User,
    { categoryId, ...createRestaurantInput }: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const category = await this.categoryRepo.findOne({
        where: { id: categoryId },
      });
      if (!category) return { ok: false, error: 'Category Not Found!' };

      await this.restaurantRepo.save(
        this.restaurantRepo.create({
          ...createRestaurantInput,
          owner,
          category,
        }),
      );

      return SUCCESSFUL_MESSAGE;
    } catch (error) {
      return { ok: false, error };
    }
  }

  async updateRestaurant(
    owner: User,
    { restaurantId, ...updateRestaurantInput }: UpdateRestaurantInput,
  ): Promise<UpdateRestaurantOutput> {
    try {
      const restaurant = await this.findOneRestaurant(owner.id, restaurantId);
      if (!restaurant) return RESTAURANT_IS_NOT_FOUND;

      await this.restaurantRepo.update(restaurantId, {
        ...updateRestaurantInput,
      });
      return SUCCESSFUL_MESSAGE;
    } catch (error) {
      return { ok: false, error: error };
    }
  }

  async deleteRestaurant(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.findOneRestaurant(owner.id, restaurantId);
      if (!restaurant) return RESTAURANT_IS_NOT_FOUND;

      await this.restaurantRepo.delete(restaurantId);
      return SUCCESSFUL_MESSAGE;
    } catch (error) {
      return { ok: false, error };
    }
  }

  async findOneRestaurant(
    userId: number,
    restaurantId: number,
  ): Promise<Restaurant | undefined> {
    return await this.restaurantRepo.findOne({
      where: {
        id: restaurantId,
        owner: {
          id: userId,
        },
      },
    });
  }
}
