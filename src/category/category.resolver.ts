import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { Category } from './entity/category.entity';
import { AllCategoriesOutput } from './dto/all-categories.dto';
import { setRole } from 'src/auth/setRole.decorator';
import { CategoryInput, CategoryOutput } from './dto/category.dto';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @ResolveField(() => Int)
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.categoryService.countRestaurants(category.id);
  }

  @Query(() => AllCategoriesOutput)
  @setRole(['Any'])
  allCategories(): Promise<AllCategoriesOutput> {
    return this.categoryService.allCategories();
  }

  @Query(() => CategoryOutput)
  @setRole(['Any'])
  findOneCategory(
    @Args('input') categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    return this.categoryService.findOneCategory(categoryInput);
  }
}
