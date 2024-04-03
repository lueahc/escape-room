import { Injectable, Logger } from '@nestjs/common';
import { HttpException, Catch, ArgumentsHost } from '@nestjs/common';

@Catch(HttpException)
@Injectable()
export class HttpExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const status = exception.getStatus();

        this.logger.error(`HTTP Exception: ${exception.message}`);

        response.status(status).json({

        });
    }
}