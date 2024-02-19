import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { Repository } from 'typeorm';
import { UpdateReviewRequestDto } from './dto/updateReview.request.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ReviewService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
        private readonly userService: UserService,
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

    async updateReview(userId: number, reviewId: number, updateReviewRequestDto: UpdateReviewRequestDto) {
        const { content, rate, difficulty, horror, activity, dramatic, story, problem, interior } = updateReviewRequestDto;

        const review = await this.getReviewById(reviewId);
        if (!review) {
            throw new NotFoundException(
                '리뷰가 존재하지 않습니다.',
                'NON_EXISTING_REVIEW'
            )
        }

        const user = await this.userService.findOneById(userId);
        if (!user) {
            throw new NotFoundException(
                '사용자가 존재하지 않습니다.',
                'NON_EXISTING_USER'
            );
        }

        const reviewWriter = review.writer;
        if (userId !== reviewWriter.id) {
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

    async deleteReview(userId: number, reviewId: number) {
        const review = await this.getReviewById(reviewId);
        if (!review) {
            throw new NotFoundException(
                '리뷰가 존재하지 않습니다.',
                'NON_EXISTING_REVIEW'
            )
        }

        const user = await this.userService.findOneById(userId);
        if (!user) {
            throw new NotFoundException(
                '사용자가 존재하지 않습니다.',
                'NON_EXISTING_USER'
            );
        }

        const reviewWriter = review.writer;
        if (userId !== reviewWriter.id) {
            return new UnauthorizedException(
                '리뷰를 등록한 사용자가 아닙니다.',
                'USER_WRITER_DISCORDANCE'
            )
        }

        await this.reviewRepository.softDelete({ id: reviewId });
    }
}
