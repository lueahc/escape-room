import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LocationEnum } from '../../store/domain/location.enum';
import { GetThemesListResponseDto } from './dto/getThemesList.response.dto';
import { ReviewService } from '../../review/application/review.service';
import { GetOneThemeResponseDto } from './dto/getOneTheme.response.dto';
import { GetVisibleReviewsResponseDto } from '../../review/application/dto/getVisibleReviews.response.dto';
import { THEME_REPOSITORY } from '../../common/inject.constant';
import { ThemeRepository } from '../domain/theme.repository';
import { Theme } from '../domain/theme.entity';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class ThemeService {
  constructor(
    @Inject(THEME_REPOSITORY)
    private readonly themeRepository: ThemeRepository,
    private readonly reviewService: ReviewService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async findOneById(id: number): Promise<Theme | null> {
    const cacheKey = `theme:${id}`;
    const cachedTheme = await this.cacheManager.get<Theme>(cacheKey);

    if (cachedTheme) {
      return cachedTheme;
    }

    const theme = await this.themeRepository.findOneById(id);
    if (theme) {
      await this.cacheManager.set(cacheKey, theme);
    }

    return theme;
  }

  private async mapThemesToResponseDto(
    themes: Theme[],
  ): Promise<GetThemesListResponseDto[]> {
    return await Promise.all(
      themes.map(async (theme) => {
        const reviewCount = await this.reviewService.countVisibleReviewsInTheme(
          theme.getId(),
        );
        return new GetThemesListResponseDto({ theme, reviewCount });
      }),
    );
  }

  async getAllThemes(): Promise<GetThemesListResponseDto[]> {
    const cacheKey = 'themes:all';
    const cachedThemes =
      await this.cacheManager.get<GetThemesListResponseDto[]>(cacheKey);

    if (cachedThemes) {
      return cachedThemes;
    }

    const themes = await this.themeRepository.findAll();
    const responseDtos = await this.mapThemesToResponseDto(themes);

    await this.cacheManager.set(cacheKey, responseDtos);
    return responseDtos;
  }

  async getThemesByLocation(
    location: LocationEnum,
  ): Promise<GetThemesListResponseDto[]> {
    const cacheKey = `themes:location:${location}`;
    const cachedThemes =
      await this.cacheManager.get<GetThemesListResponseDto[]>(cacheKey);

    if (cachedThemes) {
      return cachedThemes;
    }

    const themes = await this.themeRepository.findByLocation(location);
    const responseDtos = await this.mapThemesToResponseDto(themes);

    await this.cacheManager.set(cacheKey, responseDtos);
    return responseDtos;
  }

  async getThemesByKeyword(
    keyword: string,
  ): Promise<GetThemesListResponseDto[]> {
    const cacheKey = `themes:keyword:${keyword}`;
    const cachedThemes =
      await this.cacheManager.get<GetThemesListResponseDto[]>(cacheKey);

    if (cachedThemes) {
      return cachedThemes;
    }

    const themes = await this.themeRepository.findByKeyword(keyword);
    const responseDtos = await this.mapThemesToResponseDto(themes);

    await this.cacheManager.set(cacheKey, responseDtos);
    return responseDtos;
  }

  async getThemesByStoreId(
    storeId: number,
  ): Promise<GetThemesListResponseDto[]> {
    const cacheKey = `themes:store:${storeId}`;
    const cachedThemes =
      await this.cacheManager.get<GetThemesListResponseDto[]>(cacheKey);

    if (cachedThemes) {
      return cachedThemes;
    }

    const themes = await this.themeRepository.findByStoreId(storeId);
    const responseDtos = await this.mapThemesToResponseDto(themes);

    await this.cacheManager.set(cacheKey, responseDtos);
    return responseDtos;
  }

  async getOneTheme(id: number): Promise<GetOneThemeResponseDto> {
    const cacheKey = `theme:one:${id}`;
    const cachedTheme =
      await this.cacheManager.get<GetOneThemeResponseDto>(cacheKey);

    if (cachedTheme) {
      return cachedTheme;
    }

    const theme = await this.themeRepository.findOneById(id);
    if (!theme) {
      throw new NotFoundException(
        '테마가 존재하지 않습니다.',
        'NON_EXISTING_THEME',
      );
    }

    const themeReviewCount =
      await this.reviewService.countVisibleReviewsInTheme(id);
    const storeReviewCount =
      await this.reviewService.countVisibleReviewsInStore(
        theme.getStore().getId(),
      );
    const reviews = await this.reviewService.getThreeVisibleReviewsOfTheme(id);

    const responseDto = new GetOneThemeResponseDto({
      theme,
      themeReviewCount,
      storeReviewCount,
      reviews,
    });

    await this.cacheManager.set(cacheKey, responseDto);
    return responseDto;
  }

  async getThemeReviews(
    themeId: number,
  ): Promise<GetVisibleReviewsResponseDto[]> {
    const cacheKey = `theme:reviews:${themeId}`;
    const cachedReviews =
      await this.cacheManager.get<GetVisibleReviewsResponseDto[]>(cacheKey);

    if (cachedReviews) {
      return cachedReviews;
    }

    const reviews = await this.reviewService.getVisibleReviewsInTheme(themeId);

    await this.cacheManager.set(cacheKey, reviews);
    return reviews;
  }
}
