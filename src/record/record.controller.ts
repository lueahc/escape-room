import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { RecordService } from './record.service';
import { JwtAuthGuard } from 'src/jwt/jwt.auth.guard';
import { CreateRecordRequestDto } from './dto/createRecord.request.dto';
import { UpdateRecordRequestDto } from './dto/updateRecord.request.dto';
import { User } from 'src/user/user.decorator';

@Controller('record')
export class RecordController {
    constructor(
        private recordService: RecordService
    ) { }

    @Get()
    test() {
        return this.recordService.test();
    }

    @Post()
    @HttpCode(201)
    @UseGuards(JwtAuthGuard)
    createRecord(
        @User('id') userId: number,
        @Body() createRecordRequestDto: CreateRecordRequestDto) {
        return this.recordService.createRecord(userId, createRecordRequestDto);
    }

    @Patch('/:recordId')
    @UseGuards(JwtAuthGuard)
    updateRecord(
        @User('id') userId: number,
        @Param('recordId', ParseIntPipe) recordId: number,
        @Body() updateRecordRequestDto: UpdateRecordRequestDto) {
        return this.recordService.updateRecord(userId, recordId, updateRecordRequestDto);
    }

    @Patch('/:recordId/visibility')
    @UseGuards(JwtAuthGuard)
    changeRecordVisibility(
        @User('id') userId: number,
        @Param('recordId', ParseIntPipe) recordId: number) {
        return this.recordService.changeRecordVisibility(userId, recordId);
    }

    @Delete('/:recordId')
    @HttpCode(204)
    @UseGuards(JwtAuthGuard)
    deleteRecord(
        @User('id') userId: number,
        @Param('recordId', ParseIntPipe) recordId: number) {
        return this.recordService.deleteRecord(userId, recordId);
    }
}
