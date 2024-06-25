import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SlackModule } from 'nestjs-slack';

@Module({
  imports: [
    SlackModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'webhook',
        url: configService.get<string>('SLACK_WEBHOOK_URL') as string,
      }),
    }),
  ],
})
export class SlackAlarmModule { }
