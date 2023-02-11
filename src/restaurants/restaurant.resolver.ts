import { Resolver } from '@nestjs/graphql';
import { RestaurantService } from './restaurant.service';

@Resolver()
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}
}
