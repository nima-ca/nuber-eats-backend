import { Inject, Injectable } from '@nestjs/common';
import * as JWT from 'jsonwebtoken';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtModuleOptions } from './interface/jwt.interface';

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
