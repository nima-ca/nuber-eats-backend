import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { CategoryResolver } from './category.resolver';
import { CategoryService } from './category.service';
import { Category } from './entity/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Category])],
  providers: [CategoryResolver, CategoryService],
})
export class CategoryModule {}
