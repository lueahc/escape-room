import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { WinstonLogger } from './logger/winston.util';
import { HttpExceptionFilter } from './logger/httpException.filter';
import createSwagger from './config/swaggerConfig';
import * as expressBasicAuth from 'express-basic-auth';
import { SlackService } from 'nestjs-slack';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create(AppModule);
  const slackService = app.get(SlackService);
  const configService = app.get(ConfigService);
  const logger = await WinstonLogger(configService);
  const swaggerUser = configService.get<string>('SWAGGER_USER') as string;
  const swaggerPwd = configService.get<string>('SWAGGER_PWD') as string;
  const port = configService.get<number>('PORT') || 5000;
  app.useGlobalFilters(new HttpExceptionFilter(logger, slackService));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.enableCors();
  app.use(
    ['/api'],
    expressBasicAuth({ challenge: true, users: { [swaggerUser]: swaggerPwd } }),
  );
  createSwagger(app);
  await app.listen(port);
}
bootstrap();
