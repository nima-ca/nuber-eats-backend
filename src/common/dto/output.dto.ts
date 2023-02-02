import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MutationOutputDto {
  @Field(() => String, { nullable: true })
  error: string;

  @Field(() => Boolean)
  ok: string;
}
