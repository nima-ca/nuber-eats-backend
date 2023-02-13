import { Query, Resolver } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { Category } from './entity/category.entitiy';
import { AllCategoriesOutput } from './dto/all-categories.dto';
import { setRole } from 'src/auth/setRole.decorator';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Query(() => AllCategoriesOutput)
  @setRole(['Any'])
  allCategories(): Promise<AllCategoriesOutput> {
    return this.categoryService.allCategories();
  }
}
