import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
    @Get('/health')
    healthCheck(@Res() res: Response) {
        console.log();
        return res.status(HttpStatus.OK).send('상태 검사 성공');
    }
}