import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Inject, HttpStatus, LoggerService } from "@nestjs/common";
import { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { SlackService } from "nestjs-slack";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService,
        private readonly slackService: SlackService
    ) { }

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
            this.slackService.sendText(`서버 에러 발생: ${exception.message}`);
        }

        const context = {
            timestamp: new Date(),
            url: request.url,
            body: request.body,
        };

        this.logger.error(exception.name, exception.stack, context);

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: exception.message,
        });
    }
}