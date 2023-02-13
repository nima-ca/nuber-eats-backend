import { UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

export type AllowedRoles = keyof typeof UserRole | 'Any';
export type MockReposetory<T = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

export type totalPagesType = { totalCounts: number; count: number };
