import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateReviewRequestDto } from './dto/updateReview.request.dto';
import { CreateReviewRequestDto } from './dto/createReview.request.dto';
import { RecordService } from 'src/record/record.service';
import { GetVisibleReviewsResponseDto } from './dto/getVisibleReviews.response.dto';
import { REVIEW_REPOSITORY } from 'src/inject.constant';
import { ReviewRepository } from './domain/review.repository';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ReviewService {
    constructor(
        @Inject(REVIEW_REPOSITORY)
        private readonly reviewRepository: ReviewRepository,
        private readonly userService: UserService,
        private readonly recordService: RecordService
    ) { }

    async hasReviews(recordId: number): Promise<boolean> {
        const reviewCount = await this.reviewRepository.countReviewsInRecord(recordId);
        return reviewCount !== 0;
    }

    async countVisibleReviewsInTheme(themeId: number): Promise<number> {
        return await this.reviewRepository.countVisibleReviewsInTheme(themeId);
    }

    async countVisibleReviewsInStore(storeId: number): Promise<number> {
        return await this.reviewRepository.countVisibleReviewsInStore(storeId);
    }

    async getVisibleReviewsInTheme(themeId: number): Promise<GetVisibleReviewsResponseDto[]> {
        const reviews = await this.reviewRepository.getVisibleReviewsInTheme(themeId);

        const mapReviews = reviews.map((review) => {
            return new GetVisibleReviewsResponseDto(review);
        });

        return mapReviews;
    }

    async getThreeVisibleReviewsOfTheme(themeId: number): Promise<GetVisibleReviewsResponseDto[]> {
        const reviews = await this.reviewRepository.getThreeVisibleReviewsInTheme(themeId);

        const mapReviews = reviews.map((review) => {
            return new GetVisibleReviewsResponseDto(review);
        });

        return mapReviews;
    }

    async hasWrittenReview(userId: number, recordId: number): Promise<boolean> {
        const review = await this.reviewRepository.getOneReviewByUserIdAndRecordId(userId, recordId);
        return !!review;
    }

    async createReview(userId: number, createReviewRequestDto: CreateReviewRequestDto): Promise<void> {
        const { recordId, content, rate, activity, story, dramatic, volume, problem, difficulty, horror, interior } = createReviewRequestDto;

        const record = await this.recordService.getRecordById(recordId);
        if (!record) {
            throw new NotFoundException(
                '기록이 존재하지 않습니다.',
                'NON_EXISTING_RECORD'
            )
        }

        const user = await this.userService.findOneById(userId);
        if (!user) {
            throw new NotFoundException(
                '사용자가 존재하지 않습니다.',
                'NON_EXISTING_USER'
            );
        }

        const isTagged = await this.recordService.getOneTag(userId, recordId);
        if (!isTagged) {
            throw new ForbiddenException(
                '리뷰를 등록할 수 있는 사용자가 아닙니다.',
                'USER_FORBIDDEN')
        }

        const hasWrittenReview = await this.hasWrittenReview(userId, recordId);
        if (hasWrittenReview) {
            throw new ForbiddenException(
                `해당 기록에 이미 작성한 리뷰가 있습니다.`,
                'EXISTING_REVIEW'
            );
        }

        const review = this.reviewRepository.create({
            writer: user,
            record,
            content,
            rate,
            activity,
            story,
            dramatic,
            volume,
            problem,
            difficulty,
            horror,
            interior
        });
        await this.reviewRepository.save(review);
    }

    async updateReview(userId: number, reviewId: number, updateReviewRequestDto: UpdateReviewRequestDto): Promise<void> {
        const { content, rate, activity, story, dramatic, volume, problem, difficulty, horror, interior } = updateReviewRequestDto;

        const review = await this.reviewRepository.getReviewById(reviewId);
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
        if (userId !== reviewWriter._id) {
            throw new ForbiddenException(
                '리뷰를 등록한 사용자가 아닙니다.',
                'USER_WRITER_DISCORDANCE'
            )
        }

        review.content = content;
        review.rate = rate;
        review.activity = activity;
        review.story = story;
        review.dramatic = dramatic;
        review.volume = volume;
        review.problem = problem;
        review.difficulty = difficulty;
        review.horror = horror;
        review.interior = interior;
        await this.reviewRepository.save(review);
    }

    async deleteReview(userId: number, reviewId: number): Promise<void> {
        const review = await this.reviewRepository.getReviewById(reviewId);
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
        if (userId !== reviewWriter._id) {
            throw new ForbiddenException(
                '리뷰를 등록한 사용자가 아닙니다.',
                'USER_WRITER_DISCORDANCE'
            )
        }

        await this.reviewRepository.softDelete(reviewId);
    }
}
