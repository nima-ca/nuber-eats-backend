import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { setRole } from 'src/auth/setRole.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dto/create-order.dto';
import {
  GetOrderByIdInput,
  GetOrderByIdOutput,
  GetOrdersInput,
  GetOrdersOutput,
} from './dto/get-order.dto';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { UpdateOrderInput, UpdateOrderOutput } from './dto/update-order.dto';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Mutation(() => CreateOrderOutput)
  @setRole(['Client'])
  createOrder(
    @AuthUser() user: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.ordersService.createOrder(user, createOrderInput);
  }

  @Query(() => GetOrdersOutput)
  @setRole(['Any'])
  getOrders(
    @AuthUser() user: User,
    @Args('input') input: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.ordersService.getOrders(user, input);
  }

  @Query(() => GetOrderByIdOutput)
  @setRole(['Any'])
  getOrderById(
    @AuthUser() user: User,
    @Args('input') { orderId }: GetOrderByIdInput,
  ): Promise<GetOrderByIdOutput> {
    return this.ordersService.getOrderById(user, orderId);
  }

  @Mutation(() => UpdateOrderOutput)
  @setRole(['Delivery', 'Owner'])
  updateOrder(
    @AuthUser() user: User,
    @Args('input') updateOrderInput: UpdateOrderInput,
  ): Promise<UpdateOrderOutput> {
    return this.ordersService.updateOrder(user, updateOrderInput);
  }
}
