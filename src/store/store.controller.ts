import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { StoreService } from './store.service';
import { LocationEnum } from './location.enum';

@Controller('store')
export class StoreController {
    constructor(
        private storeService: StoreService
    ) { }

    @Get('/search')
    searchStores(@Query('keyword') keyword: string) {
        return this.storeService.getStoresByKeyword(keyword);
    }

    @Get()
    getAllStores(@Query('location') location: LocationEnum) {
        if (!location) {
            return this.storeService.getAllStores();
        }
        return this.storeService.getStoresByLocation(location);
    }

    @Get('/:storeId')
    getStoreInfo(@Param('storeId', ParseIntPipe) storeId: number) {
        return this.storeService.getStoreById(storeId);
    }
}
