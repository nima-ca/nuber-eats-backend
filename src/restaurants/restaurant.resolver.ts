import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RestaurantService } from './restaurant.service';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { setRole } from 'src/auth/setRole.decorator';
import {
  UpdateRestaurantInput,
  UpdateRestaurantOutput,
} from './dto/update-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dto/delete-restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dto/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dto/restaurant.dto';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => CreateRestaurantOutput)
  @setRole(['Owner'])
  createRestaurant(
    @AuthUser() user: User,
    @Args('input') CreateRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(user, CreateRestaurantInput);
  }

  @Mutation(() => UpdateRestaurantOutput)
  @setRole(['Owner'])
  updateRestaurant(
    @AuthUser() user: User,
    @Args('input') updateRestaurantInput: UpdateRestaurantInput,
  ): Promise<UpdateRestaurantOutput> {
    return this.restaurantService.updateRestaurant(user, updateRestaurantInput);
  }

  @Mutation(() => DeleteRestaurantOutput)
  @setRole(['Owner'])
  deleteRestaurant(
    @AuthUser() user: User,
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(user, deleteRestaurantInput);
  }

  @Query(() => RestaurantsOutput)
  @setRole(['Any'])
  allRestaurants(
    @Args('input') restaurantsInput: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    return this.restaurantService.allRestaurants(restaurantsInput);
  }

  @Query(() => RestaurantOutput)
  @setRole(['Any'])
  restaurant(
    @Args('input') restaurantInput: RestaurantInput,
  ): Promise<RestaurantOutput> {
    return this.restaurantService.restaurant(restaurantInput);
  }
}
