import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { NULLABLE } from 'src/common/common.constants';
import { CoreOutput } from 'src/common/dto/output.dto';
import { Order, OrderStatus } from '../entities/order.entity';

@InputType()
export class GetOrdersInput {
  @Field((type) => OrderStatus, NULLABLE)
  status?: OrderStatus;
}

@ObjectType()
export class GetOrdersOutput extends CoreOutput {
  @Field((type) => [Order], NULLABLE)
  orders?: Order[];
}

@InputType()
export class GetOrderByIdInput {
  @Field((type) => Int)
  orderId: number;
}

@ObjectType()
export class GetOrderByIdOutput extends CoreOutput {
  @Field((type) => Order, NULLABLE)
  order?: Order;
}
