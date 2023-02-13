import { totalPagesType } from './common.type';
import { PaginationInput } from './dto/pagination.dto';

export const mockRepo = () => ({
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findAndCount: jest.fn(),
  count: jest.fn(),
});

export const mockJWTService = () => ({
  sign: jest.fn(),
  verify: jest.fn(),
});

export const paginate = ({ page, count }: PaginationInput) => ({
  take: count,
  skip: (page - 1) * count,
});

export const totalPages = ({ count, totalCounts }: totalPagesType): number =>
  Math.ceil(totalCounts / count);
