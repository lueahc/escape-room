import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
    @Get('/')
    home(@Res() res: Response) {
        return res.status(HttpStatus.OK).send('lets-escape-room');
    }
    @Get('/health')
    healthCheck(@Res() res: Response) {
        return res.status(HttpStatus.OK).send('상태 검사 성공');
    }
}