import { Module, DynamicModule, Global } from '@nestjs/common';
import { MailModuleOptions } from './mail.interface';
import { CONFIG_OPTIONS } from 'src/common/common.constatns';
import { MailService } from './mail.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({})
export class MailModule {
  static forRoot(options: MailModuleOptions): DynamicModule {
    return {
      module: MailModule,
      imports: [HttpModule],
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        MailService,
      ],
      exports: [MailService],
    };
  }
}
