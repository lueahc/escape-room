import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LocationEnum } from '../store/location.enum';
import { GetThemesListResponseDto } from './dto/getThemesList.response.dto';
import { ReviewService } from '../review/review.service';
import { GetOneThemeResponseDto } from './dto/getOneTheme.response.dto';
import { GetVisibleReviewsResponseDto } from '../review/dto/getVisibleReviews.response.dto';
import { THEME_REPOSITORY } from '../common/inject.constant';
import { ThemeRepository } from './domain/theme.repository';
import { Theme } from './domain/theme.entity';

@Injectable()
export class ThemeService {
    constructor(
        @Inject(THEME_REPOSITORY)
        private readonly themeRepository: ThemeRepository,
        private readonly reviewService: ReviewService
    ) { }

    async findOneById(id: number): Promise<Theme | null> {
        return await this.themeRepository.findOneById(id);
    }

    private async mapThemesToResponseDto(themes: Theme[]): Promise<GetThemesListResponseDto[]> {
        return await Promise.all(themes.map(async (theme) => {
            const reviewCount = await this.reviewService.countVisibleReviewsInTheme(theme.getId());
            return new GetThemesListResponseDto({ theme, reviewCount });
        }));
    }

    async getAllThemes(): Promise<GetThemesListResponseDto[]> {
        const themes = await this.themeRepository.findAll();
        return await this.mapThemesToResponseDto(themes);
    }

    async getThemesByLocation(location: LocationEnum): Promise<GetThemesListResponseDto[]> {
        const themes = await this.themeRepository.findByLocation(location);
        return await this.mapThemesToResponseDto(themes);
    }

    async getThemesByKeyword(keyword: string): Promise<GetThemesListResponseDto[]> {
        const themes = await this.themeRepository.findByKeyword(keyword);
        return await this.mapThemesToResponseDto(themes);
    }

    async getThemesByStoreId(storeId: number): Promise<GetThemesListResponseDto[]> {
        const themes = await this.themeRepository.findByStoreId(storeId);
        return await this.mapThemesToResponseDto(themes);
    }

    async getOneTheme(id: number): Promise<GetOneThemeResponseDto> {
        const theme = await this.themeRepository.findOneById(id);
        if (!theme) {
            throw new NotFoundException(
                '테마가 존재하지 않습니다.',
                'NON_EXISTING_THEME'
            )
        }

        const themeReviewCount = await this.reviewService.countVisibleReviewsInTheme(id);
        const storeReviewCount = await this.reviewService.countVisibleReviewsInStore(theme.getStore().getId());
        const reviews = await this.reviewService.getThreeVisibleReviewsOfTheme(id);

        return new GetOneThemeResponseDto({ theme, themeReviewCount, storeReviewCount, reviews });
    }

    async getThemeReviews(themeId: number): Promise<GetVisibleReviewsResponseDto[]> {
        return await this.reviewService.getVisibleReviewsInTheme(themeId);
    }
}
