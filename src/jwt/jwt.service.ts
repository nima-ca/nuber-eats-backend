import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtModuleOptions } from './interface/jwt.interface';
import * as JWT from 'jsonwebtoken';
import { CONFIG_OPTIONS } from 'src/common/common.constatns';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {}

  sign(payload: Object): string {
    try {
      return JWT.sign(payload, this.options.secretKey);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'JWT Signing is not correctly working!',
      );
    }
  }

  verify(token: string) {
    return JWT.verify(token, this.options.secretKey);
  }
}
