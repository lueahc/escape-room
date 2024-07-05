import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { Record } from './domain/record.entity';
import { Transactional } from 'typeorm-transactional';
import { CreateRecordRequestDto } from './dto/createRecord.request.dto';
import { UpdateRecordRequestDto } from './dto/updateRecord.request.dto';
import { Tag } from './domain/tag.entity';
import { ReviewService } from '../review/review.service';
import { GetLogsResponseDto } from './dto/getLogs.response.dto';
import { CreateAndUpdateRecordResponseDto } from './dto/createAndUpdateRecord.response.dto';
import { RECORD_REPOSITORY } from '../common/inject.constant';
import { RecordRepository } from './domain/record.repository';
import { ThemeService } from '../theme/theme.service';
import { UserService } from '../user/user.service';
import { GetOneRecordResponseDto } from './dto/getOneRecord.response.dto';
import { GetRecordReviewsResponseDto } from './dto/getRecordReviews.response.dto';
import { TagPartyService } from './tagParty.service';

@Injectable()
export class RecordService {
    constructor(
        @Inject(RECORD_REPOSITORY)
        private readonly recordRepository: RecordRepository,
        private readonly userService: UserService,
        @Inject(forwardRef(() => ThemeService))
        private readonly themeService: ThemeService,
        @Inject(forwardRef(() => ReviewService))
        private readonly reviewService: ReviewService,
        private readonly tagPartyService: TagPartyService
    ) { }

    async findOneById(id: number): Promise<Record | null> {
        return await this.recordRepository.findOneById(id);
    }

    async getOneTag(userId: number, recordId: number): Promise<Tag | null> {
        return await this.recordRepository.getOneTag(userId, recordId);
    }

    private async mapReviewsToResponseDto(record: Record): Promise<GetOneRecordResponseDto> {
        const reviews = await Promise.all(record.getReviews().map(async (review) => {
            return new GetRecordReviewsResponseDto(review);
        }));
        return new GetOneRecordResponseDto({ record, reviews });
    }

    async getTaggedUsers(userId: number, recordId: number): Promise<string[]> {
        const tags = await this.recordRepository.getTaggedUsers(userId, recordId);
        return tags.map(tag => tag.getUser().getNickname());
    }

    async getLogs(userId: number): Promise<GetLogsResponseDto[]> {
        const logs = await this.recordRepository.getLogs(userId);
        return logs.map(log => new GetLogsResponseDto(log));
    }

    async getRecordAndReviews(recordId: number): Promise<GetOneRecordResponseDto> {
        const record = await this.recordRepository.getRecordInfo(recordId);
        if (!record) {
            throw new NotFoundException(
                '기록이 존재하지 않습니다.',
                'NON_EXISTING_RECORD'
            )
        }

        return await this.mapReviewsToResponseDto(record);
    }

    async getAllRecordsAndReviews(userId: number, visibility: string): Promise<GetOneRecordResponseDto[]> {
        let records;
        if (visibility === 'true') {
            records = await this.recordRepository.findVisibleRecords(userId);
        } else if (visibility === 'false') {
            records = await this.recordRepository.findHiddenRecords(userId);
        } else {
            records = await this.recordRepository.findAllRecords(userId);
        }

        return await Promise.all(records.map(async (record) => {
            return await this.mapReviewsToResponseDto(record);
        }));
    }

    @Transactional()
    async createRecord(userId: number, createRecordRequestDto: CreateRecordRequestDto, file: Express.Multer.File): Promise<CreateAndUpdateRecordResponseDto> {
        const { themeId, isSuccess, playDate, headCount, hintCount, playTime, note, party } = createRecordRequestDto;
        const image = file ? (file as any).location : null;

        const user = await this.userService.findOneById(userId);
        if (!user) {
            throw new NotFoundException(
                '사용자가 존재하지 않습니다.',
                'NON_EXISTING_USER'
            );
        }

        const theme = await this.themeService.findOneById(themeId);
        if (!theme) {
            throw new NotFoundException(
                '테마가 존재하지 않습니다.',
                'NON_EXISTING_THEME'
            );
        }

        const record = await Record.create({ user, theme, isSuccess, playDate, headCount, hintCount, playTime, image, note });
        await this.recordRepository.save(record);
        const tag = await Tag.create({ user, record, isWriter: true });
        await this.recordRepository.saveTag(tag);
        await this.tagPartyService.createTags(party, userId, headCount, record);

        return new CreateAndUpdateRecordResponseDto(record);
    }

    @Transactional()
    async updateRecord(userId: number, recordId: number, updateRecordRequestDto: UpdateRecordRequestDto, file: Express.Multer.File): Promise<CreateAndUpdateRecordResponseDto> {
        const { isSuccess, playDate, headCount, hintCount, playTime, note, party } = updateRecordRequestDto;
        const image = file ? (file as any).location : null;

        const record = await this.recordRepository.findOneById(recordId);
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

        if (record.isNotWriter(userId)) {
            throw new ForbiddenException(
                '기록을 등록한 사용자가 아닙니다.',
                'USER_WRITER_DISCORDANCE'
            )
        }

        record.updateRecord({ isSuccess, playDate, headCount, hintCount, playTime, image, note });
        await this.recordRepository.save(record);
        await this.tagPartyService.updateTags(party, userId, headCount, record);

        return new CreateAndUpdateRecordResponseDto(record);
    }

    async changeRecordVisibility(userId: number, recordId: number): Promise<void> {
        const record = await this.recordRepository.findOneById(recordId);
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

        const tag = await this.recordRepository.getOneTag(userId, recordId);
        if (!tag) {
            throw new ForbiddenException(
                '해당 기록에 태그된 사용자가 아닙니다.',
                'USER_FORBIDDEN')
        }

        tag.changeVisibility();
        await this.recordRepository.saveTag(tag);
    }

    async deleteRecord(userId: number, recordId: number): Promise<void> {
        const record = await this.recordRepository.findOneById(recordId);
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

        if (record.isNotWriter(userId)) {
            throw new ForbiddenException(
                '기록을 등록한 사용자가 아닙니다.',
                'USER_WRITER_DISCORDANCE'
            )
        }

        const hasReviews = await this.reviewService.hasReviews(recordId);
        if (hasReviews) {
            throw new BadRequestException(
                '기록에 리뷰가 존재합니다.',
                'REVIEWS_EXISTING_IN_RECORD'
            )
        } else {
            await this.recordRepository.softDelete(recordId);
        }
    }
}
