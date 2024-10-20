import { Body, Controller, Delete, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ReviewService } from '../application/review.service';
import { JwtAuthGuard } from '../../jwt/jwt.auth.guard';
import { UpdateReviewRequestDto } from '../application/dto/updateReview.request.dto';
import { User } from '../../user/presentation/user.decorator';
import { CreateReviewRequestDto } from '../application/dto/createReview.request.dto';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@Controller('review')
@ApiTags('review API')
export class ReviewController {
    constructor(
        private reviewService: ReviewService
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: '리뷰 생성 API', description: '기록에 대한 리뷰를 생성함' })
    @ApiSecurity('AdminAuth')
    createReview(
        @User('_id') userId: number,
        @Body() createReviewRequestDto: CreateReviewRequestDto): Promise<void> {
        return this.reviewService.createReview(userId, createReviewRequestDto);
    }

    @Patch('/:reviewId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: '리뷰 수정 API', description: '리뷰를 수정함' })
    @ApiSecurity('AdminAuth')
    updateReview(
        @User('_id') userId: number,
        @Param('reviewId', ParseIntPipe) reviewId: number,
        @Body() updateReviewRequestDto: UpdateReviewRequestDto): Promise<void> {
        return this.reviewService.updateReview(userId, reviewId, updateReviewRequestDto);
    }

    @Delete('/:reviewId')
    @HttpCode(204)
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: '리뷰 삭제 API', description: '리뷰를 삭제함' })
    @ApiSecurity('AdminAuth')
    deleteReview(
        @User('_id') userId: number,
        @Param('reviewId', ParseIntPipe) reviewId: number): Promise<void> {
        return this.reviewService.deleteReview(userId, reviewId);
    }
}
