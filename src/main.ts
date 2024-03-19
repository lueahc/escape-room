import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({
  path: path.resolve(
    process.env.NODE_ENV === 'production'
      ? '.production.env'
      : process.env.NODE_ENV === 'local'
        ? '.local.env'
        : '.development.env',
  ),
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { WinstonLogger } from './logger/winston.util';
import { HttpExceptionFilter } from './logger/httpException.filter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  initializeTransactionalContext();

  const app = await NestFactory.create(AppModule, {
    logger: WinstonLogger,
  });

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.enableCors();

  // const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  // app.useGlobalFilters(new HttpExceptionFilter(logger));

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
