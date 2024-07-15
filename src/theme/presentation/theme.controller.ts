import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ThemeService } from '../application/theme.service';
import { LocationEnum } from '../../store/domain/location.enum';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetThemesListResponseDto } from '../application/dto/getThemesList.response.dto';
import { GetOneThemeResponseDto } from '../application/dto/getOneTheme.response.dto';
import { GetVisibleReviewsResponseDto } from '../../review/dto/getVisibleReviews.response.dto';

@Controller('theme')
@ApiTags('theme API')
export class ThemeController {
    constructor(
        private themeService: ThemeService
    ) { }

    @Get('/search')
    @ApiOperation({ summary: '테마 검색 API', description: '테마를 검색함' })
    searchThemes(@Query('keyword') keyword: string): Promise<GetThemesListResponseDto[]> {
        return this.themeService.getThemesByKeyword(keyword);
    }

    @Get()
    @ApiOperation({ summary: '테마 전체 조회 API', description: '테마 목록을 조회함' })
    getAllThemes(@Query('location') location: LocationEnum): Promise<GetThemesListResponseDto[]> {
        if (!location) {
            return this.themeService.getAllThemes();
        }
        return this.themeService.getThemesByLocation(location);
    }

    @Get('/:themeId')
    @ApiOperation({ summary: '특정 테마 조회 API', description: '특정 테마 정보를 조회함' })
    getThemeInfo(@Param('themeId', ParseIntPipe) themeId: number): Promise<GetOneThemeResponseDto> {
        return this.themeService.getOneTheme(themeId);
    }

    @Get('/:themeId/review')
    @ApiOperation({ summary: '특정 테마 리뷰 목록 조회 API', description: '특정 테마의 리뷰 목록을 조회함' })
    getThemeReviews(@Param('themeId', ParseIntPipe) themeId: number): Promise<GetVisibleReviewsResponseDto[]> {
        return this.themeService.getThemeReviews(themeId);
    }
}
