import { Controller, Get } from '@nestjs/common';
import { ThemeService } from './theme.service';

@Controller('theme')
export class ThemeController {
    constructor(
        private themeService: ThemeService
    ) { }

    @Get()
    getAllThemes() {
        return this.themeService.getAllThemes();
    }
}
