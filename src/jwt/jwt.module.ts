import { Module, DynamicModule } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { Global } from '@nestjs/common/decorators';
import { JwtModuleOptions } from './interface/jwt.interface';
import { CONFIG_OPTIONS } from 'src/common/common.constatns';

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
