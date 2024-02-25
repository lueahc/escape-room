import { Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Theme } from './theme.entity';
import { Like, Repository } from 'typeorm';
import { LocationEnum } from '../store/location.enum';
import { GetThemesListResponseDto } from './dto/getThemesList.response.dto';
import { ReviewService } from 'src/review/review.service';
import { GetOneThemeResponseDto } from './dto/getOneTheme.response.dto';

@Injectable()
export class ThemeService {
    constructor(
        @InjectRepository(Theme)
        private readonly themeRepository: Repository<Theme>,
        private readonly reviewService: ReviewService
    ) { }

    async getThemeById(id: number) {
        return await this.themeRepository.findOne({
            relations: {
                store: true,
                records: {
                    reviews: {
                        writer: true
                    }
                }
            },
            where: {
                id
            }
        })
    }

    async getAllThemes() {
        const themes = await this.themeRepository.find({
            relations: {
                store: true
            },
        });

        const mapthemes = await Promise.all(themes.map(async (theme) => {
            const reviewCount = await this.reviewService.countVisibleReviewsOfTheme(theme.id);
            return new GetThemesListResponseDto({ theme, reviewCount });
        }));

        return mapthemes;
    }

    async getThemesByLocation(location: LocationEnum) {
        const themes = await this.themeRepository.find({
            relations: {
                store: true
            },
            where: {
                store: {
                    location
                }
            },
        });

        const mapthemes = await Promise.all(themes.map(async (theme) => {
            const reviewCount = await this.reviewService.countVisibleReviewsOfTheme(theme.id);
            return new GetThemesListResponseDto({ theme, reviewCount });
        }));

        return mapthemes;
    }

    async getThemesByKeyword(keyword: string) {
        const themes = await this.themeRepository.find({
            relations: {
                store: true
            },
            where: {
                name: Like(`%${keyword}%`)
            }
        });

        const mapthemes = await Promise.all(themes.map(async (theme) => {
            const reviewCount = await this.reviewService.countVisibleReviewsOfTheme(theme.id);
            return new GetThemesListResponseDto({ theme, reviewCount });
        }));

        return mapthemes;
    }

    async getThemesByStoreId(storeId: number) {
        const themes = await this.themeRepository.find({
            relations: {
                store: true
            },
            where: {
                store: {
                    id: storeId
                }
            },
        });

        const mapthemes = await Promise.all(themes.map(async (theme) => {
            const reviewCount = await this.reviewService.countVisibleReviewsOfTheme(theme.id);
            return new GetThemesListResponseDto({ theme, reviewCount });
        }));

        return mapthemes;
    }

    async getOneTheme(id: number) {
        const theme = await this.getThemeById(id);
        if (!theme) {
            throw new NotFoundException(
                '테마가 존재하지 않습니다.',
                'NON_EXISTING_THEME'
            )
        }

        const themeReviewCount = await this.reviewService.countVisibleReviewsOfTheme(id);
        const storeReviewCount = await this.reviewService.countVisibleReviewsOfStore(theme.store.id);
        const reviews = await this.reviewService.getVisibleReviewsOfTheme(id);

        return new GetOneThemeResponseDto({ theme, themeReviewCount, storeReviewCount, reviews });
    }
}
