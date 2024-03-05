import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { addTransactionalDataSource, deleteDataSourceByName } from 'typeorm-transactional';
import 'dotenv/config';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: () => {
                return {
                    type: process.env.DB_TYPE as any,
                    host: process.env.DB_HOST,
                    port: process.env.DB_PORT,
                    username: process.env.DB_USERNAME,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DB_DATABASE,
                    autoLoadEntities: true,
                    synchronize: true,
                    logging: true,
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
