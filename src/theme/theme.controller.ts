import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ThemeService } from './theme.service';
import { LocationEnum } from './location.enum';

@Controller('theme')
export class ThemeController {
    constructor(
        private themeService: ThemeService
    ) { }

    @Get()
    getAllThemes(@Query('location') location: LocationEnum) {
        if (!location) {
            return this.themeService.getAllThemes();
        }
        return this.themeService.getThemesByLocation(location);
    }

    @Get('/:id')
    getThemeInfo(@Param('id', ParseIntPipe) id: number) {
        return this.themeService.getThemeById(id);
    }
}
