import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { Repository, UpdateDescription } from 'typeorm';
import { Record } from './record.entity';
import { Transactional } from 'typeorm-transactional';
import { CreateRecordRequestDto } from './dto/createRecord.request.dto';
import { ThemeService } from 'src/theme/theme.service';
import { User } from 'src/user/user.entity';
import { UpdateRecordRequestDto } from './dto/updateRecord.request.dto';
import { UpdateReviewRequestDto } from './dto/updateReview.request.dto';

@Injectable()
export class ReviewService {
    constructor(
        @InjectRepository(Record)
        private readonly recordRepository: Repository<Record>,
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
        private readonly themeService: ThemeService,
    ) { }

    async getRecordById(id: number) {
        return await this.recordRepository.findOne({
            relations: {
                writer: true
            },
            where: {
                id
            }
        });
    }

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

    @Transactional()
    async createRecord(user: User, createRecordRequestDto: CreateRecordRequestDto) {
        const { themeId, isSuccess, playDate, headCount, hintCount, leftPlayTime, image,
            content, rate, difficulty, horror, activity, dramatic, story, problem, interior } = createRecordRequestDto;

        const theme = await this.themeService.getThemeById(themeId);
        if (!theme) {
            throw new NotFoundException(
                '테마가 존재하지 않습니다.',
                'NON_EXISTING_THEME'
            );
        }

        const record = this.recordRepository.create({
            writer: user,
            theme,
            isSuccess,
            playDate,
            headCount,
            hintCount,
            leftPlayTime,
            image
        });
        await this.recordRepository.save(record);

        const review = this.reviewRepository.create({
            writer: user,
            record,
            content,
            rate,
            difficulty,
            horror,
            activity,
            dramatic,
            story,
            problem,
            interior
        });
        await this.reviewRepository.save(review);

        return {}
    }

    async updateRecord(recordId: number, user: User, updateRecordRequestDto: UpdateRecordRequestDto) {
        const { themeId, isSuccess, playDate, headCount, hintCount, leftPlayTime, image } = updateRecordRequestDto;

        const record = await this.getRecordById(recordId);
        if (!record) {
            throw new NotFoundException(
                '기록이 존재하지 않습니다.',
                'NON_EXISTING_RECORD'
            )
        }

        const recordWriter = record.writer;
        if (user.id !== recordWriter.id) {
            return new UnauthorizedException(
                '기록을 등록한 사용자가 아닙니다.',
                'USER_WRITER_DISCORDANCE'
            )
        }

        const theme = await this.themeService.getThemeById(themeId);
        if (!theme) {
            throw new NotFoundException(
                '테마가 존재하지 않습니다.',
                'NON_EXISTING_THEME'
            );
        }

        record.theme = theme;
        record.isSuccess = isSuccess;
        record.playDate = playDate;
        record.headCount = headCount;
        record.hintCount = hintCount;
        record.leftPlayTime = leftPlayTime;
        record.image = image;

        await this.recordRepository.save(record);

        return {}
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

        return {}
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
}
