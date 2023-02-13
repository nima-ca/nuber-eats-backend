import { PaginationInput } from './dto/paginationdto';

export const mockRepo = () => ({
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
});

export const paginate = ({ page, count }: PaginationInput) => ({
  take: count,
  skip: (page - 1) * count,
});

export const totalPages = (totalCounts: number, count: number): number =>
  Math.ceil(totalCounts / count);
