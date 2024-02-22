import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Theme } from './theme.entity';
import { Like, Repository } from 'typeorm';
import { LocationEnum } from '../store/location.enum';

@Injectable()
export class ThemeService {
    constructor(
        @InjectRepository(Theme)
        private readonly themeRepository: Repository<Theme>,
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
        return await this.themeRepository.find({
            relations: {
                store: true
            },
        });
    }

    async getThemesByLocation(location: LocationEnum) {
        return await this.themeRepository.find({
            relations: {
                store: true
            },
            where: {
                store: {
                    location
                }
            }
        })
    }

    async getThemesByKeyword(keyword: string) {
        return await this.themeRepository.find({
            relations: {
                store: true
            },
            where: {
                name: Like(`%${keyword}%`)
            }
        })
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
