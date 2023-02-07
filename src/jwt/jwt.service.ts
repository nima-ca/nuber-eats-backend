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
    return JWT.sign(payload, this.options.secretKey);
  }

  verify(token: string) {
    return JWT.verify(token, this.options.secretKey);
  }
}
