import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from 'src/jwt/jwt.auth.guard';
import { UpdateReviewRequestDto } from './dto/updateReview.request.dto';
import { User } from 'src/user/user.decorator';
import { CreateReviewRequestDto } from './dto/createReview.request.dto';

@Controller('review')
export class ReviewController {
    constructor(
        private reviewService: ReviewService
    ) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    getVisibleReviews() {
        return this.reviewService.getVisibleReviews();
    }

    @Post()
    @HttpCode(201)
    @UseGuards(JwtAuthGuard)
    createReview(
        @User('id') userId: number,
        @Body() createReviewRequestDto: CreateReviewRequestDto) {
        return this.reviewService.createReview(userId, createReviewRequestDto);
    }

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
        return this.reviewService.deleteReview(userId, reviewId);
    }
}
