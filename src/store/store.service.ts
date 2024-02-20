import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from './store.entity';
import { Like, Repository } from 'typeorm';
import { LocationEnum } from './location.enum';

@Injectable()
export class StoreService {
    constructor(
        @InjectRepository(Store)
        private readonly storeRepository: Repository<Store>,
    ) { }

    async getStoresByKeyword(keyword: string) {
        return await this.storeRepository.find({
            relations: {
                themes: true
            },
            where: {
                name: Like(`%${keyword}%`)
            }
        })
    }

    async getAllStores() {
        return await this.storeRepository.find({
            // relations: {
            //     themes: true
            // },
        });
    }

    async getStoresByLocation(location: LocationEnum) {
        return await this.storeRepository.find({
            // relations: {
            //     themes: true
            // },
            where: {
                location
            }
        })
    }

    async getStoreById(id: number) {
        return await this.storeRepository.findOne({
            relations: {
                themes: true,
            },
            where: {
                id
            }
        })
    }
}
