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
import { ILike, Repository } from 'typeorm';
import { Category } from '../category/entity/category.entity';
import { User } from 'src/users/entities/user.entity';
import {
  CATEGORY_IS_NOT_FOUND,
  SUCCESSFUL_MESSAGE,
  RESTAURANT_IS_NOT_FOUND,
} from 'src/common/common.constatns';
import { RestaurantsInput, RestaurantsOutput } from './dto/restaurants.dto';
import { paginate, totalPages } from 'src/common/common.tools';
import { RestaurantInput, RestaurantOutput } from './dto/restaurant.dto';

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
      if (!category) return CATEGORY_IS_NOT_FOUND;

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

      if (updateRestaurantInput.categoryId) {
        const category = await this.categoryRepo.findOne({
          where: { id: updateRestaurantInput.categoryId },
        });
        if (!category) return CATEGORY_IS_NOT_FOUND;
      }

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

  async allRestaurants({
    count,
    page,
    query,
  }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalCounts] = await this.restaurantRepo.findAndCount(
        {
          where: query ? { name: ILike(`%${query}%`) } : undefined,
          ...paginate({ count, page }),
        },
      );
      return {
        ok: true,
        results: restaurants,
        totalPages: totalPages({ totalCounts, count }),
      };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async restaurant({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurantRepo.findOne({
        where: { id: restaurantId },
        relations: ['menu'],
      });

      return restaurant
        ? { ok: true, restaurant }
        : { ok: false, error: 'Restaurant is not found' };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
