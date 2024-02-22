import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { Repository } from 'typeorm';
import { UpdateReviewRequestDto } from './dto/updateReview.request.dto';
import { UserService } from 'src/user/user.service';
import { CreateReviewRequestDto } from './dto/createReview.request.dto';
import { RecordService } from 'src/record/record.service';

@Injectable()
export class ReviewService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
        private readonly userService: UserService,
        private readonly recordService: RecordService,
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

    async hasReviews(recordId: number) {
        const reviewCount = await this.reviewRepository
            .createQueryBuilder('review')
            .where('review.record_id = :recordId', { recordId })
            .getCount();
        if (reviewCount === 0) return false;
        else return true;
    }

    async countVisibleReviewsOfTheme(themeId: number) {
        const rawQuery =
            `select sum(cnt) from (select count(*) as cnt
                                from record
                                    right join review r on record.id = r.record_id
                                where record.theme_id = ?
                                    and record.writer_id = r.writer_id
                                    and record.visibility in (select visibility
                                                                from record
                                                                where record.visibility = true)
            union
                                select count(*) as cnt
                                from record
                                    right join review r on record.id = r.record_id
                                    right join tag t on record.id = t.record_id
                                where record.theme_id = ?
                                    and record.writer_id != r.writer_id
                                    and t.visibility in (select visibility
                                                            from tag
                                                            where tag.visibility = true)) ha`;
        return this.reviewRepository.query(rawQuery, [themeId, themeId]);
    }

    async createReview(userId: number, createReviewRequestDto: CreateReviewRequestDto) {
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

        const isWriter = userId === record.writer.id;
        const isTagged = await this.recordService.isUserTagged(userId, recordId);
        if (!isWriter && !isTagged) {
            throw new ForbiddenException(
                '리뷰를 등록할 수 있는 사용자가 아닙니다.',
                'USER_FORBIDDEN')
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

        return review;
    }

    async updateReview(userId: number, reviewId: number, updateReviewRequestDto: UpdateReviewRequestDto) {
        const { content, rate, activity, story, dramatic, volume, problem, difficulty, horror, interior } = updateReviewRequestDto;

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
            throw new ForbiddenException(
                '리뷰를 등록한 사용자가 아닙니다.',
                'USER_WRITER_DISCORDANCE'
            )
        }

        await this.reviewRepository.softDelete({ id: reviewId });
    }
}
