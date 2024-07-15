import { Injectable } from "@nestjs/common";
import { Like, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Theme } from "../domain/theme.entity";
import { ThemeRepository } from "../domain/theme.repository";
import { LocationEnum } from "../../store/domain/location.enum";

@Injectable()
export class TypeormThemeRepository implements ThemeRepository {
    constructor(
        @InjectRepository(Theme)
        private readonly themeRepository: Repository<Theme>,
    ) { }

    async save(theme: Theme): Promise<Theme> {
        return await this.themeRepository.save(theme);
    }

    async findOneById(id: number): Promise<Theme | null> {
        return await this.themeRepository.findOne({
            where: {
                _id: id
            },
            relations: ['_store', '_records._reviews._writer']
        });
    }

    async findAll(): Promise<Theme[]> {
        return await this.themeRepository.find({
            relations: ['_store']
        });
    }

    async findByLocation(location: LocationEnum): Promise<Theme[]> {
        return await this.themeRepository.find({
            where: {
                _store: {
                    _location: location
                }
            },
            relations: ['_store']
        });
    }

    async findByKeyword(keyword: string): Promise<Theme[]> {
        return await this.themeRepository.find({
            where: {
                _name: Like(`%${keyword}%`)
            },
            relations: ['_store']
        });
    }

    async findByStoreId(storeId: number): Promise<Theme[]> {
        return await this.themeRepository.find({
            where: {
                _store: {
                    _id: storeId
                }
            },
            relations: ['_store']
        });
    }
}