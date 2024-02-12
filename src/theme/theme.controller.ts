import { Controller, Get, Query } from '@nestjs/common';
import { ThemeService } from './theme.service';

@Controller('theme')
export class ThemeController {
    constructor(
        private themeService: ThemeService
    ) { }

    @Get()
    getAllThemes(@Query('location') location: string) {
        if (!location) {
            return this.themeService.getAllThemes();
        }
        return this.themeService.getThemesByLocation(location);
    }
}
