import { Body, Controller, HttpCode, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { RecordService } from './record.service';
import { JwtAuthGuard } from 'src/jwt/jwt.auth.guard';
import { CreateRecordRequestDto } from './dto/createRecord.request.dto';
import { UpdateRecordRequestDto } from './dto/updateRecord.request.dto';

@Controller('record')
export class RecordController {
    constructor(
        private recordService: RecordService
    ) { }

    @Post()
    @HttpCode(201)
    @UseGuards(JwtAuthGuard)
    createRecord(
        @Request() req,
        @Body() createRecordRequestDto: CreateRecordRequestDto) {

        const user = req.user;
        return this.recordService.createRecord(user, createRecordRequestDto);
    }

    @Patch('/:recordId')
    @UseGuards(JwtAuthGuard)
    updateRecord(
        @Param('recordId', ParseIntPipe) recordId: number,
        @Request() req,
        @Body() updateRecordRequestDto: UpdateRecordRequestDto) {

        const user = req.user;
        return this.recordService.updateRecord(recordId, user, updateRecordRequestDto);
    }
}
