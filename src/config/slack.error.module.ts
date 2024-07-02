import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SlackModule } from 'nestjs-slack';
import { EnvironmentVariable } from './environmentVariable.interface';

@Module({
  imports: [
    SlackModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<EnvironmentVariable>) => ({
        type: 'webhook',
        url: configService.get<string>('SLACK_WEBHOOK_URL') as string,
      }),
    }),
  ],
})
export class SlackAlarmModule { }
