import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  DISH_IS_NOT_FOUND,
  NOT_ALLOWED_ACTION,
  ORDER_IS_NOT_FOUND,
  RESTAURANT_IS_NOT_FOUND,
  SUCCESSFUL_MESSAGE,
} from 'src/common/common.constants';
import { mockRepo } from 'src/common/common.tools';
import { MockRepository } from 'src/common/common.type';
import { Dish } from 'src/dishes/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { CreateOrderInput } from './dto/create-order.dto';
import { UpdateOrderInput } from './dto/update-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order, OrderStatus } from './entities/order.entity';
import { OrdersService } from './orders.service';

describe('Orders Service', () => {
  let service: OrdersService;
  let orderRepo: MockRepository<Order>;
  let restaurantRepo: MockRepository<Restaurant>;
  let dishRepo: MockRepository<Dish>;
  let orderItemRepo: MockRepository<OrderItem>;
  let mockedUser: User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Restaurant),
          useValue: mockRepo(),
        },
        {
          provide: getRepositoryToken(Dish),
          useValue: mockRepo(),
        },
        {
          provide: getRepositoryToken(Order),
          useValue: mockRepo(),
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockRepo(),
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepo = module.get(getRepositoryToken(Order));
    restaurantRepo = module.get(getRepositoryToken(Restaurant));
    dishRepo = module.get(getRepositoryToken(Dish));
    orderItemRepo = module.get(getRepositoryToken(OrderItem));
    mockedUser = new User();
    mockedUser.id = 1;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create Order', () => {
    const RESTAURANT_ID = 1;
    const MOCKED_RESTAURANT = { id: RESTAURANT_ID };

    const DISH_ID = 1;
    const createOrderArgs: CreateOrderInput = {
      restaurantId: RESTAURANT_ID,
      items: [
        {
          dishId: DISH_ID,
          options: [{ choice: 'xl', name: 'size' }, { name: 'pickle' }],
        },
      ],
    };

    const MOCKED_DISH_PRICE = 10;
    const MOCKED_DISH_SIZE_LG_EXTRA = 3;
    const MOCKED_DISH_PICKLE_EXTRA = 2;
    const MOCKED_DISH = {
      id: DISH_ID,
      price: MOCKED_DISH_PRICE,
      options: [
        {
          name: 'size',
          choices: [{ name: 'xl', extra: MOCKED_DISH_SIZE_LG_EXTRA }],
        },
        {
          name: 'pickle',
          extra: MOCKED_DISH_PICKLE_EXTRA,
        },
      ],
    };

    it('should fail on error', async () => {
      restaurantRepo.findOne = jest.fn().mockRejectedValue(new Error());
      const result = await service.createOrder(mockedUser, createOrderArgs);
      expect(result.ok).toBe(false);
    });

    it('should fail if the restaurant is not found', async () => {
      restaurantRepo.findOne = jest.fn().mockReturnValue(undefined);

      const result = await service.createOrder(mockedUser, createOrderArgs);

      expect(result).toEqual(RESTAURANT_IS_NOT_FOUND);
    });

    it('should fail if a dish is not found', async () => {
      restaurantRepo.findOne = jest.fn().mockReturnValue(MOCKED_RESTAURANT);
      dishRepo.findOne = jest.fn().mockReturnValue(undefined);

      const result = await service.createOrder(mockedUser, createOrderArgs);
      expect(result).toEqual(DISH_IS_NOT_FOUND);
    });

    it('should create order items', async () => {
      restaurantRepo.findOne = jest.fn().mockReturnValue(MOCKED_RESTAURANT);
      dishRepo.findOne = jest.fn().mockReturnValue(MOCKED_DISH);
      await service.createOrder(mockedUser, createOrderArgs);

      expect(orderItemRepo.create).toHaveBeenCalledTimes(
        createOrderArgs.items.length,
      );
      expect(orderItemRepo.create).toHaveBeenNthCalledWith(1, {
        dish: MOCKED_DISH,
        options: createOrderArgs.items[0].options,
      });
      expect(orderItemRepo.save).toHaveBeenCalledTimes(
        createOrderArgs.items.length,
      );
    });

    it('should Calculate dishes price with extra and create order', async () => {
      const MOCKED_CREATED_ORDER_ITEM = { id: 1 };

      restaurantRepo.findOne = jest.fn().mockReturnValue(MOCKED_RESTAURANT);
      dishRepo.findOne = jest.fn().mockReturnValue(MOCKED_DISH);
      orderItemRepo.save = jest.fn().mockReturnValue(MOCKED_CREATED_ORDER_ITEM);
      orderItemRepo.create = jest
        .fn()
        .mockReturnValue(MOCKED_CREATED_ORDER_ITEM);
      orderRepo.create = jest.fn().mockReturnValue({});
      orderRepo.create = jest.fn().mockReturnValue({});
      const result = await service.createOrder(mockedUser, createOrderArgs);

      expect(orderRepo.create).toHaveBeenCalledTimes(1);
      expect(orderRepo.create).toHaveBeenCalledWith({
        customer: mockedUser,
        restaurant: MOCKED_RESTAURANT,
        total:
          MOCKED_DISH_PRICE +
          MOCKED_DISH_SIZE_LG_EXTRA +
          MOCKED_DISH_PICKLE_EXTRA,
        item: [MOCKED_CREATED_ORDER_ITEM],
      });
      expect(orderRepo.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(SUCCESSFUL_MESSAGE);
    });
  });

  describe('Get Orders', () => {
    const NULL_STATUS = { status: null };
    const PENDING_STATUS = { status: OrderStatus.Pending };
    const MOCKED_ORDERS = [
      { id: 1, status: OrderStatus.Pending },
      { id: 2, status: OrderStatus.Delivered },
    ];

    it('should fail on error', async () => {
      orderRepo.find = jest.fn().mockRejectedValue(new Error());
      const result = await service.getOrders(mockedUser, NULL_STATUS);
      expect(result.ok).toBe(false);
    });

    it('should return Driver orders if the user role is Driver', async () => {
      mockedUser.role = UserRole.Delivery;
      orderRepo.find = jest.fn().mockReturnValue(MOCKED_ORDERS);

      const result = await service.getOrders(mockedUser, NULL_STATUS);

      expect(result.ok).toBe(true);
      expect(result.orders).toBe(MOCKED_ORDERS);
      expect(orderRepo.find).toHaveBeenCalledTimes(1);
      expect(orderRepo.find).toHaveBeenCalledWith({
        where: { driver: { id: mockedUser.id } },
      });
    });

    it('should return Owner orders if the user role is Owner', async () => {
      mockedUser.role = UserRole.Owner;
      orderRepo.find = jest.fn().mockReturnValue(MOCKED_ORDERS);

      const result = await service.getOrders(mockedUser, NULL_STATUS);

      expect(result.ok).toBe(true);
      expect(result.orders).toBe(MOCKED_ORDERS);
      expect(orderRepo.find).toHaveBeenCalledTimes(1);
      expect(orderRepo.find).toHaveBeenCalledWith({
        where: { restaurant: { owner: { id: mockedUser.id } } },
      });
    });

    it('should return Client orders if the user role is Client', async () => {
      mockedUser.role = UserRole.Client;
      orderRepo.find = jest.fn().mockReturnValue(MOCKED_ORDERS);

      const result = await service.getOrders(mockedUser, NULL_STATUS);

      expect(result.ok).toBe(true);
      expect(result.orders).toBe(MOCKED_ORDERS);
      expect(orderRepo.find).toHaveBeenCalledTimes(1);
      expect(orderRepo.find).toHaveBeenCalledWith({
        where: { customer: { id: mockedUser.id } },
      });
    });

    it('should return filter based on status', async () => {
      const PENDING_STATUS_ORDERS = MOCKED_ORDERS.filter(
        (order) => order.status === OrderStatus.Pending,
      );
      mockedUser.role = UserRole.Client;
      orderRepo.find = jest.fn().mockReturnValue(PENDING_STATUS_ORDERS);
      const result = await service.getOrders(mockedUser, PENDING_STATUS);

      expect(result.ok).toBe(true);
      expect(result.orders).toBe(PENDING_STATUS_ORDERS);
      expect(orderRepo.find).toHaveBeenCalledTimes(1);
      expect(orderRepo.find).toHaveBeenCalledWith({
        where: {
          status: OrderStatus.Pending,
          customer: { id: mockedUser.id },
        },
      });
    });
  });

  describe('Get Order By Id', () => {
    const MOCKED_ORDER_ID = 1;
    it('should fail on error', async () => {
      orderRepo.findOne = jest.fn().mockRejectedValue(new Error());

      const result = await service.getOrderById(mockedUser, MOCKED_ORDER_ID);

      expect(result.ok).toBe(false);
    });

    it('should fail if no order is found', async () => {
      orderRepo.findOne = jest.fn().mockReturnValue(null);
      const result = await service.getOrderById(mockedUser, MOCKED_ORDER_ID);

      expect(orderRepo.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(ORDER_IS_NOT_FOUND);
    });

    it('should return order if the order is found based on user role', async () => {
      const MOCKED_ORDER = { id: 1 };
      mockedUser.role = UserRole.Client;
      orderRepo.findOne = jest.fn().mockReturnValue(MOCKED_ORDER);

      const result = await service.getOrderById(mockedUser, MOCKED_ORDER_ID);

      expect(result).toEqual({ ok: true, order: MOCKED_ORDER });
      expect(orderRepo.findOne).toHaveBeenCalledTimes(1);
      expect(orderRepo.findOne).toHaveBeenCalledWith({
        where: { id: MOCKED_ORDER_ID, customer: { id: mockedUser.id } },
      });
    });
  });

  describe('Update Order', () => {
    const BASE_MOCKED_UPDATE_ARGS: UpdateOrderInput = {
      id: 1,
      status: OrderStatus.Cooking,
    };

    const GET_ORDER_BY_ID_SUCCESS_RESPONSE = { ok: true };

    it('should fail on error', async () => {
      service.getOrderById = jest.fn().mockRejectedValue(new Error());

      const result = await service.updateOrder(
        mockedUser,
        BASE_MOCKED_UPDATE_ARGS,
      );

      expect(result.ok).toBe(false);
    });

    it('should fail if status is pending', async () => {
      const MOCKED_UPDATE_ARGS = {
        ...BASE_MOCKED_UPDATE_ARGS,
        status: OrderStatus.Pending,
      };
      const result = await service.updateOrder(mockedUser, MOCKED_UPDATE_ARGS);

      expect(result).toEqual(NOT_ALLOWED_ACTION);
    });

    it('should fail if the order is not found', async () => {
      service.getOrderById = jest.fn().mockReturnValue({ ok: false });

      const result = await service.updateOrder(
        mockedUser,
        BASE_MOCKED_UPDATE_ARGS,
      );

      expect(result).toEqual(ORDER_IS_NOT_FOUND);
    });

    it('should fail if user role is Owner but the status is not Cooked or Cooking', async () => {
      mockedUser.role = UserRole.Owner;
      service.getOrderById = jest
        .fn()
        .mockReturnValue(GET_ORDER_BY_ID_SUCCESS_RESPONSE);
      const MOCKED_UPDATE_ARGS: UpdateOrderInput = {
        id: 1,
        status: OrderStatus.Delivered,
      };
      const result = await service.updateOrder(mockedUser, MOCKED_UPDATE_ARGS);

      expect(result).toEqual(NOT_ALLOWED_ACTION);
    });

    it('should update order if the user role is Owner and status is Cooked or Cooking', async () => {
      mockedUser.role = UserRole.Owner;
      service.getOrderById = jest
        .fn()
        .mockReturnValue(GET_ORDER_BY_ID_SUCCESS_RESPONSE);
      const MOCKED_UPDATE_ARGS: UpdateOrderInput = {
        id: 1,
        status: OrderStatus.Cooked,
      };
      const result = await service.updateOrder(mockedUser, MOCKED_UPDATE_ARGS);

      expect(orderRepo.save).toHaveBeenCalledTimes(1);
      expect(orderRepo.save).toHaveBeenCalledWith([MOCKED_UPDATE_ARGS]);
      expect(result).toEqual(SUCCESSFUL_MESSAGE);
    });

    it('should fail if user role is Delivery but the status is not Delivered or PickedUp', async () => {
      mockedUser.role = UserRole.Delivery;
      service.getOrderById = jest
        .fn()
        .mockReturnValue(GET_ORDER_BY_ID_SUCCESS_RESPONSE);
      const MOCKED_UPDATE_ARGS: UpdateOrderInput = {
        id: 1,
        status: OrderStatus.Cooked,
      };
      const result = await service.updateOrder(mockedUser, MOCKED_UPDATE_ARGS);

      expect(result).toEqual(NOT_ALLOWED_ACTION);
    });

    it('should update order if the user role is Delivery and status is Delivered or PickedUp', async () => {
      mockedUser.role = UserRole.Delivery;
      service.getOrderById = jest
        .fn()
        .mockReturnValue(GET_ORDER_BY_ID_SUCCESS_RESPONSE);
      const MOCKED_UPDATE_ARGS: UpdateOrderInput = {
        id: 1,
        status: OrderStatus.Delivered,
      };
      const result = await service.updateOrder(mockedUser, MOCKED_UPDATE_ARGS);

      expect(orderRepo.save).toHaveBeenCalledTimes(1);
      expect(orderRepo.save).toHaveBeenCalledWith([MOCKED_UPDATE_ARGS]);
      expect(result).toEqual(SUCCESSFUL_MESSAGE);
    });
  });
});
