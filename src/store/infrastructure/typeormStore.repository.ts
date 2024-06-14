import { Injectable } from "@nestjs/common";
import { Like, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Store } from "../domain/store.entity";
import { StoreRepository } from "../domain/store.repository";
import { LocationEnum } from "../location.enum";

@Injectable()
export class TypeormStoreRepository implements StoreRepository {
    constructor(
        @InjectRepository(Store)
        private readonly storeRepository: Repository<Store>,
    ) { }

    async getAllStores(): Promise<Store[]> {
        return await this.storeRepository.find({
            order: {
                id: 'DESC'
            }
        });
    }

    async getStoresByLocation(location: LocationEnum): Promise<Store[]> {
        return await this.storeRepository.find({
            where: {
                location
            },
            order: {
                id: 'DESC'
            }
        });
    }

    async getStoresByKeyword(keyword: string): Promise<Store[]> {
        return await this.storeRepository.find({
            relations: {
                themes: true
            },
            where: {
                name: Like(`%${keyword}%`)
            }
        });
    }

    async getOneStoreById(id: number) {
        return await this.storeRepository.findOne({
            where: {
                id
            }
        });
    }
}