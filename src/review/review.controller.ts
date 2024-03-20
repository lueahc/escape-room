import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from 'src/jwt/jwt.auth.guard';
import { UpdateReviewRequestDto } from './dto/updateReview.request.dto';
import { User } from 'src/user/user.decorator';
import { CreateReviewRequestDto } from './dto/createReview.request.dto';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@Controller('review')
@ApiTags('review API')
export class ReviewController {
    constructor(
        private reviewService: ReviewService
    ) { }

    @Post()
    @HttpCode(201)
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: '리뷰 생성 API', description: '기록에 대한 리뷰를 생성함' })
    @ApiSecurity('AdminAuth')
    createReview(
        @User('id') userId: number,
        @Body() createReviewRequestDto: CreateReviewRequestDto) {
        return this.reviewService.createReview(userId, createReviewRequestDto);
    }

    @Patch('/:reviewId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: '리뷰 수정 API', description: '리뷰를 수정함' })
    @ApiSecurity('AdminAuth')
    updateReview(
        @User('id') userId: number,
        @Param('reviewId', ParseIntPipe) reviewId: number,
        @Body() updateReviewRequestDto: UpdateReviewRequestDto) {
        return this.reviewService.updateReview(userId, reviewId, updateReviewRequestDto);
    }

    @Delete('/:reviewId')
    @HttpCode(204)
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: '리뷰 삭제 API', description: '리뷰를 삭제함' })
    @ApiSecurity('AdminAuth')
    deleteReview(
        @User('id') userId: number,
        @Param('reviewId', ParseIntPipe) reviewId: number) {
        return this.reviewService.deleteReview(userId, reviewId);
    }
}
