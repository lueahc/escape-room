import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Theme } from './domain/theme.entity';
import { Like, Repository } from 'typeorm';
import { LocationEnum } from '../store/location.enum';
import { GetThemesListResponseDto } from './dto/getThemesList.response.dto';
import { ReviewService } from 'src/review/review.service';
import { GetOneThemeResponseDto } from './dto/getOneTheme.response.dto';
import { GetVisibleReviewsResponseDto } from 'src/review/dto/getVisibleReviews.response.dto';
import { THEME_REPOSITORY } from 'src/inject.constant';
import { ThemeRepository } from './domain/theme.repository';

@Injectable()
export class ThemeService {
    constructor(
        @Inject(THEME_REPOSITORY)
        private readonly themeRepository: ThemeRepository,
        private readonly reviewService: ReviewService
    ) { }

    async getAllThemes(): Promise<GetThemesListResponseDto[]> {
        const themes = await this.themeRepository.getAllThemes();

        const mapthemes = await Promise.all(themes.map(async (theme) => {
            const reviewCount = await this.reviewService.countVisibleReviewsOfTheme(theme.id);
            return new GetThemesListResponseDto({ theme, reviewCount });
        }));

        return mapthemes;
    }

    async getThemesByLocation(location: LocationEnum): Promise<GetThemesListResponseDto[]> {
        const themes = await this.themeRepository.getThemesByLocation(location);

        const mapthemes = await Promise.all(themes.map(async (theme) => {
            const reviewCount = await this.reviewService.countVisibleReviewsOfTheme(theme.id);
            return new GetThemesListResponseDto({ theme, reviewCount });
        }));

        return mapthemes;
    }

    async getThemesByKeyword(keyword: string): Promise<GetThemesListResponseDto[]> {
        const themes = await this.themeRepository.getThemesByKeyword(keyword);

        const mapthemes = await Promise.all(themes.map(async (theme) => {
            const reviewCount = await this.reviewService.countVisibleReviewsOfTheme(theme.id);
            return new GetThemesListResponseDto({ theme, reviewCount });
        }));

        return mapthemes;
    }

    async getThemesByStoreId(storeId: number): Promise<GetThemesListResponseDto[]> {
        const themes = await this.themeRepository.getThemesByStoreId(storeId);

        const mapthemes = await Promise.all(themes.map(async (theme) => {
            const reviewCount = await this.reviewService.countVisibleReviewsOfTheme(theme.id);
            return new GetThemesListResponseDto({ theme, reviewCount });
        }));

        return mapthemes;
    }

    async getOneTheme(id: number): Promise<GetOneThemeResponseDto> {
        const theme = await this.themeRepository.getThemeById(id);
        if (!theme) {
            throw new NotFoundException(
                '테마가 존재하지 않습니다.',
                'NON_EXISTING_THEME'
            )
        }

        const themeReviewCount = await this.reviewService.countVisibleReviewsOfTheme(id);
        const storeReviewCount = await this.reviewService.countVisibleReviewsOfStore(theme.store.id);
        const reviews = await this.reviewService.get3VisibleReviewsOfTheme(id);

        return new GetOneThemeResponseDto({ theme, themeReviewCount, storeReviewCount, reviews });
    }

    async getThemeReviews(themeId: number): Promise<GetVisibleReviewsResponseDto[]> {
        return await this.reviewService.getVisibleReviewsOfTheme(themeId);
    }
}
