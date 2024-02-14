import { Body, Controller, HttpCode, Post, Request, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from 'src/jwt/jwt.auth.guard';
import { CreateRecordRequestDto } from './dto/createRecord.request.dto';

@Controller('review')
export class ReviewController {
    constructor(
        private reviewService: ReviewService
    ) { }

    @Post()
    @HttpCode(201)
    @UseGuards(JwtAuthGuard)
    createRecord(@Request() req, @Body() createRecordRequestDto: CreateRecordRequestDto) {
        return this.reviewService.createRecord(req.user, createRecordRequestDto);
    }
}
