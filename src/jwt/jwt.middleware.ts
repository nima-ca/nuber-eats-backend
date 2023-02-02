import { InternalServerErrorException, NestMiddleware } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from './jwt.service';
import { UsersService } from 'src/users/users.service';

const TOKEN_NAME = 'xsrf-token';

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
        req['user'] = await this.userService.findById(payload.id);
      }
    } catch (error) {}
    next();
  }

  verifyToken(req: Request) {
    if (TOKEN_NAME in req.headers) {
      const token = req.headers[TOKEN_NAME];
      return this.jwtService.verify(token.toString());
    }
  }
}
