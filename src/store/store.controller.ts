import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { StoreService } from './store.service';
import { LocationEnum } from './location.enum';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('store')
@ApiTags('store API')
export class StoreController {
    constructor(
        private storeService: StoreService
    ) { }

    @Get('/search')
    @ApiOperation({ summary: '매장 검색 API', description: '매장을 검색함' })
    searchStores(@Query('keyword') keyword: string) {
        return this.storeService.getStoresByKeyword(keyword);
    }

    @Get()
    @ApiOperation({ summary: '매장 전체 조회 API', description: '매장 목록을 조회함' })
    getAllStores(@Query('location') location: LocationEnum) {
        if (!location) {
            return this.storeService.getAllStores();
        }
        return this.storeService.getStoresByLocation(location);
    }

    @Get('/:storeId')
    @ApiOperation({ summary: '특정 매장 조회 API', description: '특정 매장 정보를 조회함' })
    getStoreInfo(@Param('storeId', ParseIntPipe) storeId: number) {
        return this.storeService.getOneStore(storeId);
    }
}
