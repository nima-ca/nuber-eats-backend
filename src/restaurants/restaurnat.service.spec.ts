import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantService } from './restaurant.service';
import {
  RESTAURANT_IS_NOT_FOUND,
  SUCCESSFUL_MESSAGE,
  CATEGORY_IS_NOT_FOUND,
} from 'src/common/common.constatns';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { Category } from '../category/entity/category.entity';
import { MockReposetory } from 'src/common/common.type';
import { User } from 'src/users/entities/user.entity';
import { mockRepo } from 'src/common/common.tools';
import { ILike } from 'typeorm';

describe('Restaurant Service', () => {
  let service: RestaurantService;
  let restaurantRepo: MockReposetory<Restaurant>;
  let categoryRepo: MockReposetory<Category>;

  const mockedUser = new User();
  mockedUser.id = 1;

  const mockedCategory = { id: 1 };
  const RESTAURANT_ID = 1;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantService,
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

    service = module.get<RestaurantService>(RestaurantService);
    restaurantRepo = module.get(getRepositoryToken(Restaurant));
    categoryRepo = module.get(getRepositoryToken(Category));
  });

  it('should be defind', () => {
    expect(service).toBeDefined();
  });

  describe('Create Restaurant', () => {
    const createRestaurantArgs = {
      name: 'MC Donald',
      coverImage: 'https:///',
      address: 'Isfahan, Iran',
      categoryId: 1,
    };

    it('should fail if category is not found', async () => {
      categoryRepo.findOne = jest.fn().mockResolvedValue(undefined);
      const result = await service.createRestaurant(
        mockedUser,
        createRestaurantArgs,
      );

      expect(result).toEqual(CATEGORY_IS_NOT_FOUND);
      expect(categoryRepo.findOne).toHaveBeenCalledTimes(1);
      expect(categoryRepo.findOne).toHaveBeenCalledWith({
        where: { id: createRestaurantArgs.categoryId },
      });
    });

    it('should create restaurant', async () => {
      categoryRepo.findOne = jest.fn().mockResolvedValue(mockedCategory);

      const { categoryId, ...mockedRestaurantArgs } = createRestaurantArgs;
      const mockedRestaurant = {
        owner: mockedUser,
        category: mockedCategory,
        ...mockedRestaurantArgs,
      };

      restaurantRepo.create = jest.fn().mockReturnValue(mockedRestaurant);

      const result = await service.createRestaurant(
        mockedUser,
        createRestaurantArgs,
      );

      expect(result).toEqual(SUCCESSFUL_MESSAGE);

      expect(restaurantRepo.create).toHaveBeenCalledTimes(1);
      expect(restaurantRepo.create).toHaveBeenCalledWith(mockedRestaurant);

      expect(restaurantRepo.save).toHaveBeenCalledTimes(1);
      expect(restaurantRepo.save).toHaveBeenCalledWith(mockedRestaurant);
    });

    it('should fail on error', async () => {
      categoryRepo.findOne = jest.fn().mockRejectedValue(new Error());

      const result = await service.createRestaurant(
        mockedUser,
        createRestaurantArgs,
      );

      expect(result.ok).toBe(false);
      expect(result.error).toEqual(expect.any(Error));
    });
  });

  describe('Update Restaurant', () => {
    const updateRestaurantArgs = {
      restaurantId: RESTAURANT_ID,
      name: 'KFC',
    };

    it('should fail if restaurant is not found', async () => {
      service.findOneRestaurant = jest.fn().mockResolvedValue(undefined);
      const result = await service.updateRestaurant(
        mockedUser,
        updateRestaurantArgs,
      );

      expect(result).toEqual(RESTAURANT_IS_NOT_FOUND);
      expect(service.findOneRestaurant).toHaveBeenCalledTimes(1);
      expect(service.findOneRestaurant).toHaveBeenCalledWith(
        mockedUser.id,
        RESTAURANT_ID,
      );
    });

    it('should fail if there is a category in args and it is not found', async () => {
      const mockedRestaurant = { id: RESTAURANT_ID };
      service.findOneRestaurant = jest.fn().mockResolvedValue(mockedRestaurant);
      categoryRepo.findOne = jest.fn().mockResolvedValue(undefined);

      const CATEGORY_ID = 1;
      const updateRestaurantArgsWithCategory = {
        ...updateRestaurantArgs,
        categoryId: CATEGORY_ID,
      };

      const result = await service.updateRestaurant(
        mockedUser,
        updateRestaurantArgsWithCategory,
      );

      expect(result).toEqual(CATEGORY_IS_NOT_FOUND);
      expect(categoryRepo.findOne).toHaveBeenCalledTimes(1);
      expect(categoryRepo.findOne).toHaveBeenCalledWith({
        where: { id: CATEGORY_ID },
      });
    });

    it('should update restaurant', async () => {
      const mockedRestaurant = { id: RESTAURANT_ID };
      service.findOneRestaurant = jest.fn().mockResolvedValue(mockedRestaurant);

      const result = await service.updateRestaurant(
        mockedUser,
        updateRestaurantArgs,
      );

      expect(result).toEqual(SUCCESSFUL_MESSAGE);
      expect(restaurantRepo.update).toHaveBeenCalledTimes(1);

      const { restaurantId, ...restArgs } = updateRestaurantArgs;
      expect(restaurantRepo.update).toHaveBeenCalledWith(
        restaurantId,
        restArgs,
      );
    });

    it('should fail on error', async () => {
      service.findOneRestaurant = jest.fn().mockRejectedValue(new Error());
      const result = await service.updateRestaurant(
        mockedUser,
        updateRestaurantArgs,
      );

      expect(result.ok).toBe(false);
      expect(result.error).toEqual(expect.any(Error));
    });
  });

  describe('Delete Restaurant', () => {
    const deleteRestaurantArgs = { restaurantId: RESTAURANT_ID };

    it('should fail if the restaurant is not found', async () => {
      service.findOneRestaurant = jest.fn().mockResolvedValue(undefined);
      const result = await service.updateRestaurant(
        mockedUser,
        deleteRestaurantArgs,
      );

      expect(result).toEqual(RESTAURANT_IS_NOT_FOUND);
      expect(service.findOneRestaurant).toHaveBeenCalledTimes(1);
      expect(service.findOneRestaurant).toHaveBeenCalledWith(
        mockedUser.id,
        RESTAURANT_ID,
      );
    });

    it('should delete the restaurant', async () => {
      const restaurant = { id: RESTAURANT_ID };
      service.findOneRestaurant = jest.fn().mockResolvedValue(restaurant);
      const result = await service.deleteRestaurant(
        mockedUser,
        deleteRestaurantArgs,
      );

      expect(result).toEqual(SUCCESSFUL_MESSAGE);
      expect(restaurantRepo.delete).toHaveBeenCalledTimes(1);
      expect(restaurantRepo.delete).toHaveBeenCalledWith(RESTAURANT_ID);
    });

    it('should fail on error', async () => {
      service.findOneRestaurant = jest.fn().mockRejectedValue(new Error());
      const result = await service.deleteRestaurant(
        mockedUser,
        deleteRestaurantArgs,
      );

      expect(result.ok).toBe(false);
      expect(result.error).toEqual(expect.any(Error));
    });
  });

  describe('FindOne Restaurant', () => {
    const restaurant = { id: RESTAURANT_ID };
    it('should return undefined if restaurant is not found', async () => {
      restaurantRepo.findOne = jest.fn().mockResolvedValue(undefined);

      const result = await service.findOneRestaurant(
        mockedUser.id,
        restaurant.id,
      );

      expect(result).toBe(undefined);
    });

    it('should return a restaurant if found', async () => {
      restaurantRepo.findOne = jest.fn().mockResolvedValue(restaurant);

      const result = await service.findOneRestaurant(
        mockedUser.id,
        restaurant.id,
      );

      expect(result).toBe(restaurant);
      expect(restaurantRepo.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepo.findOne).toHaveBeenCalledWith({
        where: {
          id: restaurant.id,
          owner: {
            id: mockedUser.id,
          },
        },
      });
    });
  });

  describe('all restaurants', () => {
    const PAGE = 1;
    const COUNT = 10;
    const restaurants = [
      { id: 1, name: 'MC Donald' },
      { id: 2, name: 'KFC' },
    ];

    it('should return all restaurants without query', async () => {
      const allRestaurantsArgs = { page: PAGE, count: COUNT, query: '' };
      restaurantRepo.findAndCount = jest
        .fn()
        .mockResolvedValue([restaurants, restaurants.length]);

      const result = await service.allRestaurants(allRestaurantsArgs);

      expect(result).toEqual({ ok: true, results: restaurants, totalPages: 1 });
      expect(restaurantRepo.findAndCount).toHaveBeenCalledTimes(1);
      expect(restaurantRepo.findAndCount).toHaveBeenCalledWith({
        where: undefined,
        take: COUNT,
        skip: 0,
      });
    });

    it('should return all restaurants without query', async () => {
      const QUERY = 'mc donald';
      const allRestaurantsArgs = { page: PAGE, count: COUNT, query: QUERY };
      restaurantRepo.findAndCount = jest
        .fn()
        .mockResolvedValue([[restaurants[0]], 1]);

      const result = await service.allRestaurants(allRestaurantsArgs);

      expect(result).toEqual({
        ok: true,
        results: [restaurants[0]],
        totalPages: 1,
      });
      expect(restaurantRepo.findAndCount).toHaveBeenCalledTimes(1);
      expect(restaurantRepo.findAndCount).toHaveBeenCalledWith({
        where: { name: ILike(`%${QUERY}%`) },
        take: COUNT,
        skip: 0,
      });
    });

    it('should fail on error', async () => {
      const allRestaurantsArgs = { page: PAGE, count: COUNT, query: '' };
      restaurantRepo.findAndCount = jest.fn().mockRejectedValue(new Error());

      const result = await service.allRestaurants(allRestaurantsArgs);
      expect(result.ok).toBeFalsy();
      expect(result.error).toEqual(expect.any(Error));
    });
  });

  describe('restaurant', () => {
    const restaurantArgs = { restaurantId: 1 };
    it('should fail if the restaurant is not found', async () => {
      restaurantRepo.findOne = jest.fn().mockResolvedValue(undefined);

      const result = await service.restaurant(restaurantArgs);

      expect(result.ok).toBeFalsy();
      expect(result.error).toEqual(expect.any(String));
      expect(restaurantRepo.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepo.findOne).toHaveBeenCalledWith({
        where: { id: restaurantArgs.restaurantId },
        relations: ['menu'],
      });
    });

    it('should return restaurant', async () => {
      const restaurant = { id: 1 };
      restaurantRepo.findOne = jest.fn().mockResolvedValue(restaurant);

      const result = await service.restaurant(restaurantArgs);

      expect(result).toEqual({ ok: true, restaurant });
    });

    it('should fail on error', async () => {
      restaurantRepo.findOne = jest.fn().mockRejectedValue(new Error());
      const result = await service.restaurant(restaurantArgs);

      expect(result.ok).toBeFalsy();
      expect(result.error).toEqual(expect.any(Error));
    });
  });
});
