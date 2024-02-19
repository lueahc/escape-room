import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Record } from './record.entity';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { CreateRecordRequestDto } from './dto/createRecord.request.dto';
import { UpdateRecordRequestDto } from './dto/updateRecord.request.dto';
import { ThemeService } from 'src/theme/theme.service';
import { UserService } from 'src/user/user.service';
import { Tag } from './tag.entity';

@Injectable()
export class RecordService {
    constructor(
        @InjectRepository(Record)
        private readonly recordRepository: Repository<Record>,
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>,
        private readonly userService: UserService,
        private readonly themeService: ThemeService,
    ) { }

    async test() {
        return await this.recordRepository.find({
            relations: {
                reviews: true
            },
        });
    }

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

    @Transactional()
    async createRecord(userId: number, createRecordRequestDto: CreateRecordRequestDto) {
        const { themeId, isSuccess, playDate, headCount, hintCount, playTime, image, party } = createRecordRequestDto;

        const user = await this.userService.findOneById(userId);
        if (!user) {
            throw new NotFoundException(
                '사용자가 존재하지 않습니다.',
                'NON_EXISTING_USER'
            );
        }

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
            playTime,
            image
        });
        await this.recordRepository.save(record);

        if (party) {
            if (headCount < party.length) {
                throw new BadRequestException(
                    '일행으로 추가할 사용자 수가 인원 수보다 많습니다.',
                    'PARTY_LENGTH_OVER_HEADCOUNT'
                )
            }

            for (const memberId of party) {
                const member = await this.userService.findOneById(memberId);
                if (!member) {
                    throw new NotFoundException(
                        '일행이 존재하지 않습니다.',
                        'NON_EXISTING_PARTY'
                    );
                }

                const tag = this.tagRepository.create({
                    user: member,
                    record
                });
                await this.tagRepository.save(tag);
            }
        }

        return record;
    }

    @Transactional()
    async updateRecord(userId: number, recordId: number, updateRecordRequestDto: UpdateRecordRequestDto) {
        const { themeId, isSuccess, playDate, headCount, hintCount, playTime, image, party } = updateRecordRequestDto;

        const record = await this.getRecordById(recordId);
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

        const recordWriter = record.writer;
        if (userId !== recordWriter.id) {
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
        record.playTime = playTime;
        record.image = image;
        await this.recordRepository.save(record);

        return record;
    }
}
