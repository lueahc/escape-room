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

async function bootstrap() {
  initializeTransactionalContext();

  const app = await NestFactory.create(AppModule, { logger: WinstonLogger });
  const slackService = app.get(SlackService);
  app.useGlobalFilters(new HttpExceptionFilter(WinstonLogger, slackService));

  app.use(
    ['/api'],
    expressBasicAuth({
      challenge: true,
      users: { [process.env.SWAGGER_USER as string]: process.env.SWAGGER_PWD as string },
    }),
  );
  createSwagger(app);

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors();
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
