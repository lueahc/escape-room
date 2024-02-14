import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { Repository, UpdateDescription } from 'typeorm';
import { Record } from './record.entity';
import { Transactional } from 'typeorm-transactional';
import { CreateRecordRequestDto } from './dto/createRecord.request.dto';
import { ThemeService } from 'src/theme/theme.service';
import { User } from 'src/user/user.entity';
import { UpdateRecordRequestDto } from './dto/updateRecord.request.dto';

@Injectable()
export class ReviewService {
    constructor(
        @InjectRepository(Record)
        private readonly recordRepository: Repository<Record>,
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
        private readonly themeService: ThemeService,
    ) { }

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

        return {
            record,
            review
        }
    }

    async updateRecord(userId: number, updateRecordRequestDto: UpdateRecordRequestDto) {
        const { themeId, isSuccess, playDate, headCount, hintCount, leftPlayTime, image } = updateRecordRequestDto;

        const theme = await this.themeService.getThemeById(themeId);
        if (!theme) {
            throw new NotFoundException(
                '테마가 존재하지 않습니다.',
                'NON_EXISTING_THEME'
            );
        }
    }
}
