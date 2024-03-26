import { utilities, WinstonModule } from 'nest-winston';
import * as winstonDaily from 'winston-daily-rotate-file';
import * as winston from 'winston';

const env = process.env.NODE_ENV;
const logDir = __dirname + '/../../logs';

// error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
const dailyOptions = (level: string) => {
    return {
        level,
        datePattern: 'YYYY-MM-DD',
        dirname: logDir + `/${level}`,
        filename: `%DATE%.${level}.log`,
        maxFiles: 30,
        zippedArchive: true,
    };
};

export const WinstonLogger = WinstonModule.createLogger({
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

