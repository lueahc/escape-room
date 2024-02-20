import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from './store.entity';
import { Like, Repository } from 'typeorm';

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
}
