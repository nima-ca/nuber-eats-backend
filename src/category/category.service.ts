import { Injectable } from '@nestjs/common';
import { AllCategoriesOutput } from './dto/all-categories.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Repository } from 'typeorm';
import { Category } from './entity/category.entity';
import { CategoryInput, CategoryOutput } from './dto/category.dto';
import { CATEGORY_IS_NOT_FOUND } from 'src/common/common.constatns';
import { paginate, totalPages } from 'src/common/common.tools';

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
      const categories = await this.categoryRepo.find();
      return { ok: true, categories };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async findOneCategory({
    slug,
    count,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categoryRepo.findOne({ where: { slug } });
      if (!category) return CATEGORY_IS_NOT_FOUND;

      const [restaurants, totalCounts] = await this.restaurantRepo.findAndCount(
        {
          where: {
            category: { id: category.id },
          },
          ...paginate({ page, count }),
        },
      );
      return {
        ok: true,
        category,
        restaurants,
        totalPages: totalPages({ totalCounts, count }),
      };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async countRestaurants(categoryId: number) {
    return await this.restaurantRepo.count({
      where: {
        category: {
          id: categoryId,
        },
      },
    });
  }
}
