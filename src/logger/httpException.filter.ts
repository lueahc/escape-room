import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    InternalServerErrorException,
    Logger, Inject
} from "@nestjs/common";
import { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {

    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: Logger,
    ) { }

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const context = {
            timestamp: new Date(),
            url: request.url,
            body: request.body,
        };

        this.logger.error(exception.name, exception.stack, context);

        const err = new InternalServerErrorException();

        response.status(err.getStatus()).json(err.getResponse());
    }
}