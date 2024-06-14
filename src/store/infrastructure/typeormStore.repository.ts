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

    async findAll(): Promise<Store[]> {
        return await this.storeRepository.find({
            order: { id: 'DESC' }
        });
    }

    async findByLocation(location: LocationEnum): Promise<Store[]> {
        return await this.storeRepository.find({
            where: { location },
            order: { id: 'DESC' }
        });
    }

    async findByKeyword(keyword: string): Promise<Store[]> {
        return await this.storeRepository.find({
            where: {
                name: Like(`%${keyword}%`)
            },
            relations: ['themes']
        });
    }

    async findOneById(id: number) {
        return await this.storeRepository.findOne({
            where: { id }
        });
    }
}