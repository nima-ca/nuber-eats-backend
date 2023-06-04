import { NestMiddleware } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators';
import { NextFunction, Request, Response } from 'express';
import {
  JWT_TOKEN_NAME_IN_REQ_HEADER,
  USER_KEY,
} from 'src/common/common.constants';
import { UsersService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = this.verifyToken(req);
      if (typeof payload === 'object' && payload.hasOwnProperty('id')) {
        req[USER_KEY] = await this.userService.findById(payload.id);
      }
    } catch (error) {}
    next();
  }

  verifyToken(req: Request) {
    if (JWT_TOKEN_NAME_IN_REQ_HEADER in req.headers) {
      const token = req.headers[JWT_TOKEN_NAME_IN_REQ_HEADER];
      return this.jwtService.verify(token.toString());
    }
  }
}
