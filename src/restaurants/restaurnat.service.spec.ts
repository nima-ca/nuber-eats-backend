import { Test, TestingModule } from '@nestjs/testing';
import {
  CATEGORY_IS_NOT_FOUND,
  RESTAURANT_IS_NOT_FOUND,
  RestaurantService,
} from './restaurant.service';
import { SUCCESSFUL_MESSAGE, mockRepo } from 'src/common/common.constatns';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { Category } from './entities/category.entitiy';
import { MockReposetory } from 'src/common/common.type';
import { User } from 'src/users/entities/user.entity';

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
});
