import * as joi from 'joi';

export const envValidationSchema = {
  NODE_ENV: joi.string().valid('dev', 'prod', 'test').required(),
  DB_HOST: joi.string().required(),
  DB_PORT: joi.string().required(),
  DB_USERNAME: joi.string().required(),
  DB_PASSWORD: joi.string().required(),
  DB_NAME: joi.string().required(),
  SECRET_KEY: joi.string().required(),
  EMAIL_PASS: joi.string().required(),
  EMAIL_SERVICE: joi.string().required(),
  EMAIL_ACCOUNT: joi.string().required(),
};
