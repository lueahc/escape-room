import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LocationEnum } from './location.enum';
import { GetStoresListResponseDto } from './dto/getStoresList.response.dto';
import { ReviewService } from '../review/review.service';
import { ThemeService } from '../theme/theme.service';
import { GetOneStoreResponseDto } from './dto/getOneStore.response.dto';
import { STORE_REPOSITORY } from '../common/inject.constant';
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

    private async mapStoresToResponseDto(stores: Store[]): Promise<GetStoresListResponseDto[]> {
        return await Promise.all(stores.map(async (store) => {
            const reviewCount = await this.reviewService.countVisibleReviewsInStore(store.getId());
            return new GetStoresListResponseDto({ store, reviewCount });
        }));
    }

    async getAllStores(): Promise<GetStoresListResponseDto[]> {
        const stores = await this.storeRepository.findAll();
        return await this.mapStoresToResponseDto(stores);
    }

    async getStoresByLocation(location: LocationEnum): Promise<GetStoresListResponseDto[]> {
        const stores = await this.storeRepository.findByLocation(location);
        return await this.mapStoresToResponseDto(stores);
    }

    async getStoresByKeyword(keyword: string): Promise<GetStoresListResponseDto[]> {
        const stores = await this.storeRepository.findByKeyword(keyword);
        return await this.mapStoresToResponseDto(stores);
    }

    async getOneStore(id: number): Promise<GetOneStoreResponseDto> {
        const store = await this.storeRepository.findOneById(id);
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
