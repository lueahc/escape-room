import { Injectable } from "@nestjs/common";
import { Like, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Theme } from "../domain/theme.entity";
import { ThemeRepository } from "../domain/theme.repository";
import { LocationEnum } from "src/store/location.enum";

@Injectable()
export class TypeormThemeRepository implements ThemeRepository {
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

    async getAllThemes(): Promise<Theme[]> {
        return await this.themeRepository.find({
            relations: {
                store: true
            },
        });
    }

    async getThemesByLocation(location: LocationEnum): Promise<Theme[]> {
        return await this.themeRepository.find({
            relations: {
                store: true
            },
            where: {
                store: {
                    location
                }
            },
        });
    }

    async getThemesByKeyword(keyword: string): Promise<Theme[]> {
        return await this.themeRepository.find({
            relations: {
                store: true
            },
            where: {
                name: Like(`%${keyword}%`)
            }
        });
    }

    async getThemesByStoreId(storeId: number): Promise<Theme[]> {
        return await this.themeRepository.find({
            relations: {
                store: true
            },
            where: {
                store: {
                    id: storeId
                }
            },
        });
    }
}