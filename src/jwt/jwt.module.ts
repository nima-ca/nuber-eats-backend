import { DynamicModule, Module } from '@nestjs/common';
import { Global } from '@nestjs/common/decorators';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtModuleOptions } from './interface/jwt.interface';
import { JwtService } from './jwt.service';

@Global()
@Module({})
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtModule,
      providers: [JwtService, { provide: CONFIG_OPTIONS, useValue: options }],
      exports: [JwtService],
    };
  }
}
