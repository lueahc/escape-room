import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { Repository } from 'typeorm';
import { UpdateReviewRequestDto } from './dto/updateReview.request.dto';
import { UserService } from 'src/user/user.service';
import { CreateReviewRequestDto } from './dto/createReview.request.dto';
import { RecordService } from 'src/record/record.service';
import { GetVisibleReviewsResponseDto } from './dto/getVisibleReviews.response.dto';
import { USER_REPOSITORY } from 'src/inject.constant';
import { UserRepository } from 'src/user/domain/user.repository';

@Injectable()
export class ReviewService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        private readonly recordService: RecordService
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

    async hasReviews(recordId: number): Promise<boolean> {
        const reviewCount = await this.reviewRepository
            .createQueryBuilder('review')
            .where('review.record_id = :recordId', { recordId })
            .getCount();

        if (reviewCount === 0) return false;
        else return true;
    }

    async countVisibleReviewsOfTheme(themeId: number): Promise<number> {
        const reviewCount = await this.reviewRepository.createQueryBuilder('r')
            .leftJoin('record', 'r2', 'r.record_id = r2.id')
            .leftJoin('tag', 't', 't.record_id = r.record_id and r.writer__id = t.user__id')
            .addSelect('r.id', 'id')
            .where('r2.theme_id = :themeId and t.visibility = true', { themeId })
            .getCount();

        return reviewCount;
    }

    async countVisibleReviewsOfStore(storeId: number): Promise<number> {
        const reviewCount = await this.reviewRepository.createQueryBuilder('r')
            .leftJoin('record', 'r2', 'r.record_id = r2.id')
            .leftJoin('theme', 't', 'r2.theme_id = t.id')
            .leftJoin('tag', 't2', 't2.record_id = r.record_id and r.writer__id = t2.user__id')
            .addSelect('r.id', 'id')
            .where('t.store_id = :storeId and t2.visibility = true', { storeId })
            .getCount();

        return reviewCount;
    }

    async getVisibleReviewsOfTheme(themeId: number): Promise<GetVisibleReviewsResponseDto[]> {
        const reviews = await this.reviewRepository.createQueryBuilder('r')
            .leftJoinAndSelect('record', 'r2', 'r.record_id = r2.id')
            .leftJoinAndSelect('user', 'u', 'u.id = r.writer__id')
            .leftJoin('theme', 't', 'r2.theme_id = t.id')
            .leftJoin('store', 's', 't.store_id = s.id')
            .leftJoinAndSelect('tag', 't2', 't2.record_id = r.record_id and r.writer__id = t2.user__id')
            .addSelect('u._nickname', 'nickname')
            .addSelect('s.name', 'store_name')
            .addSelect('t.name', 'theme_name')
            .where('t2.visibility = true and t.id = :themeId', { themeId })
            .orderBy('r.created_at', 'DESC')
            .getRawMany();

        const mapReviews = reviews.map((review) => {
            return new GetVisibleReviewsResponseDto(review);
        });

        return mapReviews;
    }

    async get3VisibleReviewsOfTheme(themeId: number): Promise<GetVisibleReviewsResponseDto[]> {
        const reviews = await this.reviewRepository.createQueryBuilder('r')
            .leftJoinAndSelect('record', 'r2', 'r.record_id = r2.id')
            .leftJoinAndSelect('user', 'u', 'u.id = r.writer__id')
            .leftJoin('theme', 't', 'r2.theme_id = t.id')
            .leftJoin('store', 's', 't.store_id = s.id')
            .leftJoinAndSelect('tag', 't2', 't2.record_id = r.record_id and r.writer__id = t2.user__id')
            .addSelect('u._nickname', 'nickname')
            .addSelect('s.name', 'store_name')
            .addSelect('t.name', 'theme_name')
            .where('t2.visibility = true and t.id = :themeId', { themeId })
            .orderBy('r.created_at', 'DESC')
            .limit(3)
            .getRawMany();

        const mapReviews = reviews.map((review) => {
            return new GetVisibleReviewsResponseDto(review);
        });

        return mapReviews;
    }

    async hasWrittenReview(userId: number, recordId: number): Promise<boolean> {
        const review = await this.reviewRepository.findOne({
            relations: {
                writer: true
            },
            where: {
                writer: {
                    _id: userId
                },
                record: {
                    id: recordId
                }
            }
        });

        if (!review) return false;
        else return true;
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

        const user = await this.userRepository.findOneById(userId);
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

        const review = await this.getReviewById(reviewId);
        if (!review) {
            throw new NotFoundException(
                '리뷰가 존재하지 않습니다.',
                'NON_EXISTING_REVIEW'
            )
        }

        const user = await this.userRepository.findOneById(userId);
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
        const review = await this.getReviewById(reviewId);
        if (!review) {
            throw new NotFoundException(
                '리뷰가 존재하지 않습니다.',
                'NON_EXISTING_REVIEW'
            )
        }

        const user = await this.userRepository.findOneById(userId);
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

        await this.reviewRepository.softDelete({ id: reviewId });
    }
}
