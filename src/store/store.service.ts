import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from './store.entity';
import { Like, Repository } from 'typeorm';
import { LocationEnum } from './location.enum';
import { GetStoresListResponseDto } from './dto/getStoresList.response.dto';
import { ReviewService } from 'src/review/review.service';
import { ThemeService } from 'src/theme/theme.service';
import { GetOneStoreResponseDto } from './dto/getOneStore.response.dto';

@Injectable()
export class StoreService {
    constructor(
        @InjectRepository(Store)
        private readonly storeRepository: Repository<Store>,
        private readonly reviewService: ReviewService,
        private readonly themeService: ThemeService
    ) { }

    async getAllStores() {
        const stores = await this.storeRepository.find({
            order: {
                id: 'DESC'
            }
        });

        const mapstores = await Promise.all(stores.map(async (store) => {
            const reviewCount = await this.reviewService.countVisibleReviewsOfStore(store.id);
            return new GetStoresListResponseDto({ store, reviewCount });
        }));

        return mapstores;
    }

    async getStoresByLocation(location: LocationEnum) {
        const stores = await this.storeRepository.find({
            where: {
                location
            },
            order: {
                id: 'DESC'
            }
        });

        const mapstores = await Promise.all(stores.map(async (store) => {
            const reviewCount = await this.reviewService.countVisibleReviewsOfStore(store.id);
            return new GetStoresListResponseDto({ store, reviewCount });
        }));

        return mapstores;
    }

    async getStoresByKeyword(keyword: string) {
        const stores = await this.storeRepository.find({
            relations: {
                themes: true
            },
            where: {
                name: Like(`%${keyword}%`)
            }
        });

        const mapstores = await Promise.all(stores.map(async (store) => {
            const reviewCount = await this.reviewService.countVisibleReviewsOfStore(store.id);
            return new GetStoresListResponseDto({ store, reviewCount });
        }));

        return mapstores;
    }

    async getOneStore(id: number) {
        const store = await this.storeRepository.findOne({
            where: {
                id
            }
        });
        if (!store) {
            throw new NotFoundException(
                '매장이 존재하지 않습니다.',
                'NON_EXISTING_STORE'
            )
        }

        const reviewCount = await this.reviewService.countVisibleReviewsOfStore(store.id);
        const themes = await this.themeService.getThemesByStoreId(store.id);

        return new GetOneStoreResponseDto({ store, reviewCount, themes });
    }
}
