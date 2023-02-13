import { CoreOutput } from 'src/common/dto/output.dto';
import { Category } from '../entity/category.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AllCategoriesOutput extends CoreOutput {
  @Field(() => [Category], { nullable: true })
  categories?: Category[];
}
