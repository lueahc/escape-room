import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ThemeService } from './theme.service';
import { LocationEnum } from '../store/location.enum';

@Controller('theme')
export class ThemeController {
    constructor(
        private themeService: ThemeService
    ) { }

    @Get('/search')
    searchThemes(@Query('keyword') keyword: string) {
        const result = this.themeService.getThemesByKeyword(keyword);
        return result
    }

    @Get()
    getAllThemes(@Query('location') location: LocationEnum) {
        if (!location) {
            return this.themeService.getAllThemes();
        }
        return this.themeService.getThemesByLocation(location);
    }

    @Get('/:themeId')
    getThemeInfo(@Param('themeId', ParseIntPipe) themeId: number) {
        return this.themeService.getOneTheme(themeId);
    }
}
