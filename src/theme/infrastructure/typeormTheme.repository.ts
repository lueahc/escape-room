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

    async findOneById(id: number) {
        return await this.themeRepository.findOne({
            where: { id },
            relations: ['store', 'records.reviews.writer']
        });
    }

    async findAll(): Promise<Theme[]> {
        return await this.themeRepository.find({
            relations: ['store']
        });
    }

    async findByLocation(location: LocationEnum): Promise<Theme[]> {
        return await this.themeRepository.find({
            where: {
                store: {
                    location
                }
            },
            relations: ['store']
        });
    }

    async findByKeyword(keyword: string): Promise<Theme[]> {
        return await this.themeRepository.find({
            where: {
                name: Like(`%${keyword}%`)
            },
            relations: ['store']
        });
    }

    async findByStoreId(storeId: number): Promise<Theme[]> {
        return await this.themeRepository.find({
            where: {
                store: {
                    id: storeId
                }
            },
            relations: ['store']
        });
    }
}