import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateReviewRequestDto } from './dto/updateReview.request.dto';
import { CreateReviewRequestDto } from './dto/createReview.request.dto';
import { RecordService } from '../../record/application/record.service';
import { GetVisibleReviewsResponseDto } from './dto/getVisibleReviews.response.dto';
import { REVIEW_REPOSITORY } from '../../common/inject.constant';
import { ReviewRepository } from '../domain/review.repository';
import { UserService } from '../../user/application/user.service';
import { Review } from '../domain/review.entity';

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

    async hasWrittenReview(userId: number, recordId: number): Promise<boolean> {
        const review = await this.reviewRepository.findOneByUserIdAndRecordId(userId, recordId);
        return !!review;
    }

    private async mapReviewsToResponseDto(reviews: Review[]): Promise<GetVisibleReviewsResponseDto[]> {
        return await Promise.all(reviews.map(async (review) => {
            return new GetVisibleReviewsResponseDto(review);
        }));
    }

    async getVisibleReviewsInTheme(themeId: number): Promise<GetVisibleReviewsResponseDto[]> {
        const reviews = await this.reviewRepository.getVisibleReviewsInTheme(themeId);
        return await this.mapReviewsToResponseDto(reviews);
    }

    async getThreeVisibleReviewsOfTheme(themeId: number): Promise<GetVisibleReviewsResponseDto[]> {
        const reviews = await this.reviewRepository.getThreeVisibleReviewsInTheme(themeId);
        return await this.mapReviewsToResponseDto(reviews);
    }

    async createReview(userId: number, createReviewRequestDto: CreateReviewRequestDto): Promise<void> {
        const { recordId, content, rate, activity, story, dramatic, volume, problem, difficulty, horror, interior } = createReviewRequestDto;

        const record = await this.recordService.findOneById(recordId);
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

        const review = await Review.create({ user, record, content, rate, activity, story, dramatic, volume, problem, difficulty, horror, interior });
        await this.reviewRepository.save(review);
    }

    async updateReview(userId: number, reviewId: number, updateReviewRequestDto: UpdateReviewRequestDto): Promise<void> {
        const review = await this.reviewRepository.findOneById(reviewId);
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

        if (review.isNotWriter(userId)) {
            throw new ForbiddenException(
                '리뷰를 등록한 사용자가 아닙니다.',
                'USER_WRITER_DISCORDANCE'
            )
        }

        review.updateReview(updateReviewRequestDto);
        await this.reviewRepository.save(review);
    }

    async deleteReview(userId: number, reviewId: number): Promise<void> {
        const review = await this.reviewRepository.findOneById(reviewId);
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

        if (review.isNotWriter(userId)) {
            throw new ForbiddenException(
                '리뷰를 등록한 사용자가 아닙니다.',
                'USER_WRITER_DISCORDANCE'
            )
        }

        await this.reviewRepository.softDelete(reviewId);
    }
}
