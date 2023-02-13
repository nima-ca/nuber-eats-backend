import { MockReposetory } from 'src/common/common.type';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { RestaurantService } from 'src/restaurants/restaurant.service';
import { Category } from './entity/category.entity';
import { User } from 'src/users/entities/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockRepo, paginate, totalPages } from 'src/common/common.tools';
import { CategoryService } from './category.service';
import { CATEGORY_IS_NOT_FOUND } from 'src/common/common.constatns';

describe('Category Service', () => {
  let service: CategoryService;
  let restaurantRepo: MockReposetory<Restaurant>;
  let categoryRepo: MockReposetory<Category>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Restaurant),
          useValue: mockRepo(),
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockRepo(),
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    restaurantRepo = module.get(getRepositoryToken(Restaurant));
    categoryRepo = module.get(getRepositoryToken(Category));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('allCategories', () => {
    const categories = [{ id: 1 }, { id: 2 }];

    it('should return all categories', async () => {
      categoryRepo.find = jest.fn().mockResolvedValue(categories);
      const result = await service.allCategories();

      expect(result).toEqual({ ok: true, categories });
      expect(categoryRepo.find).toHaveBeenCalledTimes(1);
    });

    it('should fail on error', async () => {
      categoryRepo.find = jest.fn().mockRejectedValue(new Error());
      const result = await service.allCategories();

      expect(result).toEqual({ ok: false, error: expect.any(Error) });
    });
  });

  describe('findOneCategory', () => {
    const PAGE = 1;
    const COUNT = 10;

    const SLUG = 'fastfood';
    const findOneCategoryArgs = {
      slug: SLUG,
      count: COUNT,
      page: PAGE,
    };

    it('should fail if the category is not found', async () => {
      categoryRepo.findOne = jest.fn().mockResolvedValue(undefined);

      const result = await service.findOneCategory(findOneCategoryArgs);

      expect(result).toEqual(CATEGORY_IS_NOT_FOUND);
      expect(categoryRepo.findOne).toHaveBeenCalledTimes(1);
      expect(categoryRepo.findOne).toHaveBeenCalledWith({
        where: { slug: SLUG },
      });
    });

    it("should return category and it's restaurants", async () => {
      const category = { id: 1 };
      const restaurants = [{ id: 1 }, { id: 2 }];
      categoryRepo.findOne = jest.fn().mockResolvedValue(category);
      restaurantRepo.findAndCount = jest
        .fn()
        .mockResolvedValue([restaurants, restaurants.length]);

      const result = await service.findOneCategory(findOneCategoryArgs);

      expect(result).toEqual({
        ok: true,
        category,
        restaurants,
        totalPages: 1,
      });
      expect(restaurantRepo.findAndCount).toHaveBeenCalledTimes(1);
      expect(restaurantRepo.findAndCount).toHaveBeenCalledWith({
        where: {
          category: { id: category.id },
        },
        skip: 0,
        take: COUNT,
      });
    });

    it('should fail on error', async () => {
      categoryRepo.findOne = jest.fn().mockRejectedValue(new Error());

      const result = await service.findOneCategory(findOneCategoryArgs);

      expect(result).toEqual({ ok: false, error: expect.any(Error) });
    });
  });

  describe('countRestaurants', () => {
    const numberOfRestaurantsInACategory = 10;
    const categoryId = 1;

    it('should return the number of restaurant in a category', async () => {
      restaurantRepo.count = jest
        .fn()
        .mockResolvedValue(numberOfRestaurantsInACategory);
      const result = await service.countRestaurants(categoryId);

      expect(result).toBe(numberOfRestaurantsInACategory);
      expect(restaurantRepo.count).toHaveBeenCalledTimes(1);
      expect(restaurantRepo.count).toHaveBeenCalledWith({
        where: {
          category: {
            id: categoryId,
          },
        },
      });
    });
  });
});
