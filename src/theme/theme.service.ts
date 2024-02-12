import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Theme } from './theme.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ThemeService {
    constructor(
        @InjectRepository(Theme)
        private readonly themeRepository: Repository<Theme>,
    ) { }

    async getAllThemes() {
        return await this.themeRepository.find({
            select: {
                id: true,
                name: true,
                image: true,
                price: true,
                time: true,
                store: {
                    id: true,
                    name: true
                }
            },
            relations: {
                store: true
            },
        });
    }
}
