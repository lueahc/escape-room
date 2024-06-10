import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { addTransactionalDataSource, deleteDataSourceByName } from 'typeorm-transactional';
import { EnvironmentVariable } from './environmentVariable.interface';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            // useFactory: () => {
            //     return {
            //         type: process.env.DB_TYPE as any,
            //         host: process.env.DB_HOST,
            //         port: process.env.DB_PORT,
            //         username: process.env.DB_USERNAME,
            //         password: process.env.DB_PASSWORD,
            //         database: process.env.DB_DATABASE,
            //         autoLoadEntities: true,
            //         synchronize: true,
            //         logging: false,
            //         namingStrategy: new SnakeNamingStrategy(),
            //     };
            // },
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService<EnvironmentVariable>) => {
                return {
                    type: configService.get<string>('DB_TYPE') as any,
                    host: configService.get<string>('DB_HOST'),
                    port: configService.get<number>('DB_PORT'),
                    username: configService.get<string>('DB_USERNAME'),
                    password: configService.get<string>('DB_PASSWORD'),
                    database: configService.get<string>('DB_DATABASE'),
                    synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
                    autoLoadEntities: true,
                    logging: false,
                    namingStrategy: new SnakeNamingStrategy(),
                };
            },
            dataSourceFactory: async (options) => {
                if (!options) {
                    throw new Error('Invalid options passed');
                }
                deleteDataSourceByName('default');
                return addTransactionalDataSource(new DataSource(options));
            },
        }),
    ],
})
export class DatabaseModule { }
