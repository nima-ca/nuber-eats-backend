import { ApolloDriver } from '@nestjs/apollo';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as joi from 'joi';
import { envValidationSchema } from 'src/common/envValidationSchema';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { Category } from './category/entity/category.entity';
import { CommonModule } from './common/common.module';
import { DishesModule } from './dishes/dishes.module';
import { Dish } from './dishes/entities/dish.entity';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { JwtModule } from './jwt/jwt.module';
import { MailModule } from './mail/mail.module';
import { OrderItem } from './orders/entities/order-item.entity';
import { Order } from './orders/entities/order.entity';
import { OrdersModule } from './orders/orders.module';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { RestaurantModule } from './restaurants/restaurant.module';
import { User } from './users/entities/user.entity';
import { Verification } from './users/entities/verification.entity';
import { UsersModule } from './users/users.module';

export const entities = [
  User,
  Verification,
  Restaurant,
  Category,
  Dish,
  Order,
  OrderItem,
];
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: joi.object(envValidationSchema),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== 'prod',
      logging: false,
      entities,
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      driver: ApolloDriver,
      context: ({ req }) => ({ user: req['user'] }), // add user to context of graphql
    }),
    UsersModule,
    CommonModule,
    AuthModule,
    JwtModule.forRoot({ secretKey: process.env.SECRET_KEY }),
    AuthModule,
    MailModule.forRoot({
      pass: process.env.EMAIL_PASS,
      service: process.env.EMAIL_SERVICE,
      fromEmail: process.env.EMAIL_ACCOUNT,
    }),
    RestaurantModule,
    CategoryModule,
    DishesModule,
    OrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes({ path: '/graphql', method: RequestMethod.ALL });
  }
}
