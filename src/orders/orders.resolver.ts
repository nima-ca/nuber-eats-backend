import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderInput, CreateOrderOutput } from './dto/create-order.dto';
import { setRole } from 'src/auth/setRole.decorator';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';

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
}
