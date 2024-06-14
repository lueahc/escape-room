import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LocationEnum } from './location.enum';
import { GetStoresListResponseDto } from './dto/getStoresList.response.dto';
import { ReviewService } from 'src/review/review.service';
import { ThemeService } from 'src/theme/theme.service';
import { GetOneStoreResponseDto } from './dto/getOneStore.response.dto';
import { STORE_REPOSITORY } from 'src/inject.constant';
import { StoreRepository } from './domain/store.repository';
import { Store } from './domain/store.entity';

@Injectable()
export class StoreService {
    constructor(
        @Inject(STORE_REPOSITORY)
        private readonly storeRepository: StoreRepository,
        private readonly reviewService: ReviewService,
        private readonly themeService: ThemeService
    ) { }

    async mapResponseDto(stores: Store[]): Promise<GetStoresListResponseDto[]> {
        return await Promise.all(stores.map(async (store) => {
            const reviewCount = await this.reviewService.countVisibleReviewsInStore(store.id);
            return new GetStoresListResponseDto({ store, reviewCount });
        }));
    }

    async getAllStores(): Promise<GetStoresListResponseDto[]> {
        const stores = await this.storeRepository.getAllStores();
        const mapstores = await this.mapResponseDto(stores);
        return mapstores;
    }

    async getStoresByLocation(location: LocationEnum): Promise<GetStoresListResponseDto[]> {
        const stores = await this.storeRepository.getStoresByLocation(location);
        const mapstores = await this.mapResponseDto(stores);
        return mapstores;
    }

    async getStoresByKeyword(keyword: string): Promise<GetStoresListResponseDto[]> {
        const stores = await this.storeRepository.getStoresByKeyword(keyword);
        const mapstores = await this.mapResponseDto(stores);
        return mapstores;
    }

    async getOneStore(id: number): Promise<GetOneStoreResponseDto> {
        const store = await this.storeRepository.getOneStoreById(id);
        if (!store) {
            throw new NotFoundException(
                '매장이 존재하지 않습니다.',
                'NON_EXISTING_STORE'
            )
        }

        const reviewCount = await this.reviewService.countVisibleReviewsInStore(id);
        const themes = await this.themeService.getThemesByStoreId(id);

        return new GetOneStoreResponseDto({ store, reviewCount, themes });
    }
}
