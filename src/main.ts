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
import createSwagger from './config/swaggerConfig';
import * as expressBasicAuth from 'express-basic-auth';

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create(AppModule, {
    logger: WinstonLogger,
  });
  app.use(
    ['/api'],
    expressBasicAuth({
      challenge: true,
      users: { [process.env.SWAGGER_USER as string]: process.env.SWAGGER_PWD as string },
    }),
  );
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.enableCors();
  createSwagger(app);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
