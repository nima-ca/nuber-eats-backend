import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DISH_IS_NOT_FOUND,
  ORDER_IS_NOT_FOUND,
  RESTAURANT_IS_NOT_FOUND,
  SUCCESSFUL_MESSAGE,
} from 'src/common/common.constants';
import { Dish } from 'src/dishes/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dto/create-order.dto';
import {
  GetOrderByIdOutput,
  GetOrdersInput,
  GetOrdersOutput,
} from './dto/get-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(Dish) private readonly dishRepo: Repository<Dish>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
  ) {}

  async createOrder(
    customer: User,
    { items, restaurantId }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurantRepo.findOne({
        where: { id: restaurantId },
      });
      if (!restaurant) return RESTAURANT_IS_NOT_FOUND;

      let orderFinalPrice = 0;
      const orderItems: OrderItem[] = [];
      for (const item of items) {
        const dish = await this.dishRepo.findOne({
          where: { id: item.dishId },
        });
        if (!dish) return DISH_IS_NOT_FOUND;

        let dishFinalPrice = dish.price;
        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === itemOption.name,
          );
          if (dishOption) {
            if (dishOption.extra) {
              dishFinalPrice = dishFinalPrice + dishOption.extra;
            } else {
              const dishOptionChoice = dishOption.choices?.find(
                (optionChoice) => optionChoice.name === itemOption.choice,
              );
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  dishFinalPrice = dishFinalPrice + dishOptionChoice.extra;
                }
              }
            }
          }
        }
        orderFinalPrice = orderFinalPrice + dishFinalPrice;
        const orderItem = await this.orderItemRepo.save(
          this.orderItemRepo.create({
            dish,
            options: item.options,
          }),
        );
        orderItems.push(orderItem);
      }
      await this.orderRepo.save(
        this.orderRepo.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          item: orderItems,
        }),
      );
      return SUCCESSFUL_MESSAGE;
    } catch (error) {
      console.log(error);
      return { ok: false, error };
    }
  }

  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      const orders = await this.orderRepo.find({
        where: {
          ...(status && { status }),
          ...(user.role === UserRole.Delivery && { driver: { id: user.id } }),
          ...(user.role === UserRole.Client && { customer: { id: user.id } }),
          ...(user.role === UserRole.Owner && {
            restaurant: { owner: { id: user.id } },
          }),
        },
      });

      return { ok: true, orders };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async getOrderById(user: User, orderId: number): Promise<GetOrderByIdOutput> {
    try {
      const order = await this.orderRepo.findOne({
        where: {
          id: orderId,
          ...(user.role === UserRole.Delivery && { driver: { id: user.id } }),
          ...(user.role === UserRole.Client && { customer: { id: user.id } }),
          ...(user.role === UserRole.Owner && {
            restaurant: { owner: { id: user.id } },
          }),
        },
      });
      if (!order) return ORDER_IS_NOT_FOUND;

      return {
        ok: true,
        order,
      };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
