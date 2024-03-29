import { CoreOutput } from './dto/output.dto';

export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';
export const JWT_TOKEN_NAME_IN_REQ_HEADER = 'xsrf-token';
export const ROLE_METADATA_KEY = 'ROLES';
export const USER_KEY = 'user';
export const SUCCESSFUL_MESSAGE: CoreOutput = { ok: true };

export const RESTAURANT_IS_NOT_FOUND: CoreOutput = {
  ok: false,
  error: 'Restaurant is not found!',
};

export const CATEGORY_IS_NOT_FOUND: CoreOutput = {
  ok: false,
  error: 'Category is not found!',
};

export const DISH_IS_NOT_FOUND: CoreOutput = {
  ok: false,
  error: 'Dish is not found!',
};

export const ORDER_IS_NOT_FOUND: CoreOutput = {
  ok: false,
  error: 'Order is not found!',
};

export const NOT_ALLOWED_ACTION: CoreOutput = {
  ok: false,
  error: 'you are not allowed to perform this action',
};

export const NULLABLE = { nullable: true };
