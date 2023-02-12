export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';
export const JWT_TOKEN_NAME_IN_REQ_HEADER = 'xsrf-token';
export const ROLE_METADATA_KEY = 'ROLES';
export const SUCCESSFUL_MESSAGE = { ok: true };
export const mockRepo = () => ({
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
});
