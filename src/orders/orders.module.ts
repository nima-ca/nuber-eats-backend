import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersResolver } from './orders.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Dish } from 'src/dishes/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { OrderItem } from './entities/order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Dish, Restaurant, OrderItem])],
  providers: [OrdersResolver, OrdersService],
})
export class OrdersModule {}
