import { Injectable } from '@nestjs/common';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entitiy';
import { User } from 'src/users/entities/user.entity';

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

      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
