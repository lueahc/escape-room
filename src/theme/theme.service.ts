import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Theme } from './theme.entity';
import { Like, Repository } from 'typeorm';
import { LocationEnum } from '../store/location.enum';
import { GetThemesListResponseDto } from './dto/getThemesList.response.dto';
import { ReviewService } from 'src/review/review.service';

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
        return await this.themeRepository.findOne({
            // select: {
            //     id: true,
            //     name: true,
            //     store: {
            //         id: true,
            //         name: true,
            //     },
            //     records: {
            //         id: true,
            //         playDate: true,
            //         reviews: {
            //             id: true,
            //             writer: {
            //                 nickname: true
            //             },
            //             rate: true
            //         }
            //     }
            // },
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
}
