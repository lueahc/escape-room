import { Body, Controller, Delete, HttpCode, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from 'src/jwt/jwt.auth.guard';
import { CreateRecordRequestDto } from './dto/createRecord.request.dto';
import { User } from 'src/user/user.decorator';
import { UpdateRecordRequestDto } from './dto/updateRecord.request.dto';
import { UpdateReviewRequestDto } from './dto/updateReview.request.dto';

@Controller('review')
export class ReviewController {
    constructor(
        private reviewService: ReviewService
    ) { }

    @Post()
    @HttpCode(201)
    @UseGuards(JwtAuthGuard)
    createRecord(
        @Request() req,
        @Body() createRecordRequestDto: CreateRecordRequestDto) {

        const user = req.user;
        return this.reviewService.createRecord(user, createRecordRequestDto);
    }

    @Patch('/record/:recordId')
    @UseGuards(JwtAuthGuard)
    updateRecord(
        @Param('recordId', ParseIntPipe) recordId: number,
        @Request() req,
        @Body() updateRecordRequestDto: UpdateRecordRequestDto) {

        const user = req.user;
        return this.reviewService.updateRecord(recordId, user, updateRecordRequestDto);
    }

    @Patch('/:id')
    @UseGuards(JwtAuthGuard)
    updateReview(
        @Param('id', ParseIntPipe) id: number,
        @Request() req,
        @Body() updateReviewRequestDto: UpdateReviewRequestDto) {

        const user = req.user;
        return this.reviewService.updateReview(id, user, updateReviewRequestDto);
    }

    @Delete('/:id')
    @UseGuards(JwtAuthGuard)
    deleteReview(
        @Param('id', ParseIntPipe) id: number,
        @Request() req) {

        const user = req.user;
        return this.reviewService.deleteReview(id, user)
    }
}
