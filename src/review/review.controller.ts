import { Body, Controller, Delete, HttpCode, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from 'src/jwt/jwt.auth.guard';
import { UpdateReviewRequestDto } from './dto/updateReview.request.dto';
import { User } from 'src/user/user.decorator';

@Controller('review')
export class ReviewController {
    constructor(
        private reviewService: ReviewService
    ) { }

    @Patch('/:reviewId')
    @UseGuards(JwtAuthGuard)
    updateReview(
        @User('id') userId: number,
        @Param('reviewId', ParseIntPipe) reviewId: number,
        @Body() updateReviewRequestDto: UpdateReviewRequestDto) {
        return this.reviewService.updateReview(userId, reviewId, updateReviewRequestDto);
    }

    @Delete('/:reviewId')
    @HttpCode(204)
    @UseGuards(JwtAuthGuard)
    deleteReview(
        @User('id') userId: number,
        @Param('reviewId', ParseIntPipe) reviewId: number) {
        return this.reviewService.deleteReview(userId, reviewId)
    }
}
