import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Theme } from './theme.entity';
import { Like, Repository } from 'typeorm';
import { LocationEnum } from './location.enum';

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

    async getThemesByLocation(location: LocationEnum) {
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
            where: {
                store: {
                    location
                }
            }
        })
    }

    async getThemesByKeyword(keyword: string) {
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
            where: {
                name: Like(`%${keyword}%`)
            }
        })
    }

    async getThemeById(id: number) {
        return await this.themeRepository.findOne({
            select: {
                id: true,
                name: true,
                plot: true,
                image: true,
                price: true,
                time: true,
                store: {
                    id: true,
                    name: true,
                    phoneNo: true,
                    address: true,
                    homepageUrl: true
                },
                records: {
                    id: true,
                    isSuccess: true,
                    playDate: true,
                    headCount: true,
                    hintCount: true,
                    leftPlayTime: true,
                    reviews: {
                        id: true,
                        writer: {
                            nickname: true
                        },
                        rate: true
                    }
                }
            },
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
