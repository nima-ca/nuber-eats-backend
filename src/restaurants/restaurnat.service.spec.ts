import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantService } from './restaurant.service';
import { mockRepo } from 'src/common/common.constatns';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { Category } from './entities/category.entitiy';
import { MockReposetory } from 'src/common/common.type';
import { User, UserRole } from 'src/users/entities/user.entity';

describe('Restaurant Service', () => {
  let service: RestaurantService;
  let restaurantRepo: MockReposetory<Restaurant>;
  let categoryRepo: MockReposetory<Category>;

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

    const mockedUser = new User();
    mockedUser.id = 1;

    const mockedCategory = { id: 1 };

    it('should fail if category is not found', async () => {
      categoryRepo.findOne = jest.fn().mockResolvedValue(undefined);
      const result = await service.createRestaurant(
        mockedUser,
        createRestaurantArgs,
      );

      expect(result.ok).toBe(false);
      expect(result.error).toEqual(expect.any(String));
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

      expect(result.ok).toBe(true);
      expect(result.error).toBeFalsy();

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

  it.todo('Update Restaurant');
  it.todo('Delete Restaurant');
  it.todo('FindOne Restaurant');
});
