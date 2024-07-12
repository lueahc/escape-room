import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvironmentVariable } from './environmentVariable.interface';
import * as Joi from 'joi';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath:
                process.env.NODE_ENV === 'production'
                    ? '.production.env'
                    : process.env.NODE_ENV === 'test'
                        ? '.test.env'
                        : process.env.NODE_ENV === 'development'
                            ? '.development.env'
                            : '.local.env',
            validationSchema: Joi.object<EnvironmentVariable, true>({
                NODE_ENV: Joi.string().required(),
                PORT: Joi.number().required(),
                DB_TYPE: Joi.string().required(),
                DB_HOST: Joi.string().required(),
                DB_PORT: Joi.number().required(),
                DB_DATABASE: Joi.string().required(),
                DB_USERNAME: Joi.string().required(),
                DB_PASSWORD: Joi.string().required(),
                DB_SYNCHRONIZE: Joi.boolean().required(),
                JWT_SECRET: Joi.string().required(),
                JWT_EXPIRES_IN: Joi.string().required(),
                AWS_S3_REGION: Joi.string().required(),
                AWS_S3_ACCESS_KEY: Joi.string().required(),
                AWS_S3_SECRET_ACCESS_KEY: Joi.string().required(),
                AWS_S3_BUCKET: Joi.string().required(),
                SWAGGER_USER: Joi.string().required(),
                SWAGGER_PWD: Joi.string().required(),
                SLACK_WEBHOOK_URL: Joi.string().required(),
            }),
        }),
    ],
})
export class AppConfigModule { }