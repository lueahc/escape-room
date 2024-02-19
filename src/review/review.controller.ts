import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Request, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from 'src/jwt/jwt.auth.guard';
import { UpdateReviewRequestDto } from './dto/updateReview.request.dto';

@Controller('review')
export class ReviewController {
    constructor(
        private reviewService: ReviewService
    ) { }

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
    @HttpCode(204)
    @UseGuards(JwtAuthGuard)
    deleteReview(
        @Param('id', ParseIntPipe) id: number,
        @Request() req) {

        const user = req.user;
        return this.reviewService.deleteReview(id, user)
    }

    @Get()
    show() {
        return this.reviewService.show();
    }
}
