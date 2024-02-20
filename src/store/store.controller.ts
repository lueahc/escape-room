import { Controller, Get, Query } from '@nestjs/common';
import { StoreService } from './store.service';

@Controller('store')
export class StoreController {
    constructor(
        private storeService: StoreService
    ) { }

    @Get('/search')
    searchStores(@Query('keyword') keyword: string) {
        return this.storeService.getStoresByKeyword(keyword);
    }
}
