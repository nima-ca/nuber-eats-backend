import { Module, DynamicModule } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { Global } from '@nestjs/common/decorators';
import { JwtModuleOptions } from './interface/jwt.interface';
import { JWT_CONFIG_OPTIONS } from './jwt.constant';

@Global()
@Module({})
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtModule,
      providers: [
        JwtService,
        { provide: JWT_CONFIG_OPTIONS, useValue: options },
      ],
      exports: [JwtService],
    };
  }
}
