import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import { Order } from '../entities/order.entity';

@InputType()
export class UpdateOrderInput extends PickType(Order, ['status', 'id']) {}

@ObjectType()
export class UpdateOrderOutput extends CoreOutput {}
