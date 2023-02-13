import { Resolver } from '@nestjs/graphql';
import { DishesService } from './dishes.service';

@Resolver()
export class DishesResolver {
  constructor(private readonly dishesService: DishesService) {}
}
