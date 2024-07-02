import { utilities, WinstonModule } from 'nest-winston';
import * as winstonDaily from 'winston-daily-rotate-file';
import * as winston from 'winston';
import { ConfigService } from '@nestjs/config';

export const WinstonLogger = async (configService: ConfigService) => {
    const env = configService.get<string>('NODE_ENV') || 'development';
    const logDir = __dirname + '/../../logs';

    const dailyOptions = (level: string) => {
        return {
            level,
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + `/${level}`,
            filename: `%DATE%.${level}.log`,
            maxFiles: configService.get<number>('LOG_MAX_FILES', 180),
            zippedArchive: true,
        };
    };

    return WinstonModule.createLogger({
        transports: [
            new winston.transports.Console({
                level: env === 'production' ? 'http' : 'silly',
                format:
                    env === 'production'
                        ? winston.format.simple()
                        : winston.format.combine(
                            winston.format.timestamp(),
                            utilities.format.nestLike('ESCAPE-ROOM', {
                                prettyPrint: true,
                            }),
                        ),
            }),
            new winstonDaily(dailyOptions('info')),
            new winstonDaily(dailyOptions('warn')),
            new winstonDaily(dailyOptions('error')),
        ],
    });
};