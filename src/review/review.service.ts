import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { Repository } from 'typeorm';
import { Record } from '../record/record.entity';
import { User } from 'src/user/user.entity';
import { UpdateReviewRequestDto } from './dto/updateReview.request.dto';

@Injectable()
export class ReviewService {
    constructor(
        @InjectRepository(Record)
        private readonly recordRepository: Repository<Record>,
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
    ) { }

    async getReviewById(id: number) {
        return await this.reviewRepository.findOne({
            relations: {
                writer: true
            },
            where: {
                id
            }
        });
    }

    async updateReview(reviewId: number, user: User, updateReviewRequestDto: UpdateReviewRequestDto) {
        const { content, rate, difficulty, horror, activity, dramatic, story, problem, interior } = updateReviewRequestDto;

        const review = await this.getReviewById(reviewId);
        if (!review) {
            throw new NotFoundException(
                '리뷰가 존재하지 않습니다.',
                'NON_EXISTING_REVIEW'
            )
        }

        const reviewWriter = review.writer;
        if (user.id !== reviewWriter.id) {
            return new UnauthorizedException(
                '리뷰를 등록한 사용자가 아닙니다.',
                'USER_WRITER_DISCORDANCE'
            )
        }

        review.content = content;
        review.rate = rate;
        review.difficulty = difficulty;
        review.horror = horror;
        review.activity = activity;
        review.dramatic = dramatic;
        review.story = story;
        review.problem = problem;
        review.interior = interior;

        await this.reviewRepository.save(review);

        return review;
    }

    async deleteReview(reviewId: number, user: User) {
        const review = await this.getReviewById(reviewId);
        if (!review) {
            throw new NotFoundException(
                '리뷰가 존재하지 않습니다.',
                'NON_EXISTING_REVIEW'
            )
        }

        const reviewWriter = review.writer;
        if (user.id !== reviewWriter.id) {
            return new UnauthorizedException(
                '리뷰를 등록한 사용자가 아닙니다.',
                'USER_WRITER_DISCORDANCE'
            )
        }

        await this.reviewRepository.softDelete({ id: reviewId });
    }

    async show() {
        return await this.recordRepository.find({
            relations: {
                reviews: true
            },
        });
    }
}
