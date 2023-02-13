import { Injectable } from '@nestjs/common';
import { AllCategoriesOutput } from './dto/all-categories.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Repository } from 'typeorm';
import { Category } from './entity/category.entitiy';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
    } catch (error) {
      return { ok: false, error, categories: [] };
    }
  }
}
