import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { RecordService } from './record.service';
import { JwtAuthGuard } from 'src/jwt/jwt.auth.guard';
import { CreateRecordRequestDto } from './dto/createRecord.request.dto';
import { UpdateRecordRequestDto } from './dto/updateRecord.request.dto';
import { User } from 'src/user/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('record')
export class RecordController {
    constructor(
        private recordService: RecordService
    ) { }

    @Get('/log')
    @UseGuards(JwtAuthGuard)
    getLogs(@User('id') userId: number) {
        return this.recordService.getLogs(userId);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    getAllRecordsAndReviews(
        @User('id') userId: number,
        @Query('visibility') visibility: string) {
        return this.recordService.getAllRecordsAndReviews(userId, visibility);
    }

    @Get('/:recordId/tag')
    @UseGuards(JwtAuthGuard)
    getRecordandReviews(
        @User('id') userId: number,
        @Param('recordId', ParseIntPipe) recordId: number) {
        return this.recordService.getTaggedNicknamesByRecordId(userId, recordId);
    }

    @Get('/:recordId')
    @UseGuards(JwtAuthGuard)
    getTaggedUsersByRecordId(@Param('recordId', ParseIntPipe) recordId: number) {
        return this.recordService.getRecordAndReviews(recordId);
    }

    @Post('/upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(
        @UploadedFile()
        file: Express.Multer.File
    ) {
        return file
    }

    @Post()
    @HttpCode(201)
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    createRecord(
        @User('id') userId: number,
        @Body() createRecordRequestDto: CreateRecordRequestDto,
        @UploadedFile() file: Express.Multer.File,) {
        return this.recordService.createRecord(userId, createRecordRequestDto, file);
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
