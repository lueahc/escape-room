import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { RecordService } from '../application/record.service';
import { JwtAuthGuard } from '../../jwt/jwt.auth.guard';
import { CreateRecordRequestDto } from '../application/dto/createRecord.request.dto';
import { UpdateRecordRequestDto } from '../application/dto/updateRecord.request.dto';
import { User } from '../../user/presentation/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { GetLogsResponseDto } from '../application/dto/getLogs.response.dto';
import { CreateAndUpdateRecordResponseDto } from '../application/dto/createAndUpdateRecord.response.dto';
import { GetOneRecordResponseDto } from '../application/dto/getOneRecord.response.dto';

@Controller('record')
@ApiTags('record API')
export class RecordController {
    constructor(
        private recordService: RecordService
    ) { }

    @Get('/log')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: '탈출일지 조회 API', description: '회원의 탈출일지를 조회함' })
    @ApiSecurity('AdminAuth')
    getLogs(@User('_id') userId: number): Promise<GetLogsResponseDto[]> {
        return this.recordService.getLogs(userId);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: '기록리뷰 조회 API', description: '기록과 리뷰 목록을 조회함' })
    @ApiSecurity('AdminAuth')
    getAllRecordsAndReviews(
        @User('_id') userId: number,
        @Query('visibility') visibility: string): Promise<GetOneRecordResponseDto[]> {
        return this.recordService.getAllRecordsAndReviews(userId, visibility);
    }

    @Get('/:recordId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: '특정 기록리뷰 조회 API', description: '특정한 기록리뷰를 조회함' })
    @ApiSecurity('AdminAuth')
    getRecordandReviews(@Param('recordId', ParseIntPipe) recordId: number): Promise<GetOneRecordResponseDto> {
        return this.recordService.getRecordAndReviews(recordId);
    }

    @Get('/:recordId/tag')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: '특정 기록에 태그된 회원 조회 API', description: '특정한 기록에 태그된 회원을 조회함' })
    @ApiSecurity('AdminAuth')
    getTaggedUsers(
        @User('_id') userId: number,
        @Param('recordId', ParseIntPipe) recordId: number): Promise<string[]> {
        return this.recordService.getTaggedUsers(userId, recordId);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: '기록 생성 API', description: '기록을 생성함' })
    @ApiConsumes('multipart/form-data')
    @ApiSecurity('AdminAuth')
    createRecord(
        @User('_id') userId: number,
        @Body() createRecordRequestDto: CreateRecordRequestDto,
        @UploadedFile() file: Express.Multer.File): Promise<CreateAndUpdateRecordResponseDto> {
        return this.recordService.createRecord(userId, createRecordRequestDto, file);
    }

    @Patch('/:recordId')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: '기록 내용 수정 API', description: '기록의 내용을 수정함' })
    @ApiConsumes('multipart/form-data')
    @ApiSecurity('AdminAuth')
    updateRecord(
        @User('_id') userId: number,
        @Param('recordId', ParseIntPipe) recordId: number,
        @Body() updateRecordRequestDto: UpdateRecordRequestDto,
        @UploadedFile() file: Express.Multer.File): Promise<CreateAndUpdateRecordResponseDto> {
        return this.recordService.updateRecord(userId, recordId, updateRecordRequestDto, file);
    }

    @Patch('/:recordId/visibility')
    @HttpCode(204)
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: '기록 공개여부 수정 API', description: '기록의 공개여부를 수정함' })
    @ApiSecurity('AdminAuth')
    changeRecordVisibility(
        @User('_id') userId: number,
        @Param('recordId', ParseIntPipe) recordId: number): Promise<void> {
        return this.recordService.changeRecordVisibility(userId, recordId);
    }

    @Delete('/:recordId')
    @HttpCode(204)
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: '기록 삭제 API', description: '기록을 삭제함' })
    @ApiSecurity('AdminAuth')
    deleteRecord(
        @User('_id') userId: number,
        @Param('recordId', ParseIntPipe) recordId: number): Promise<void> {
        return this.recordService.deleteRecord(userId, recordId);
    }
}
