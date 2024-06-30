import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve('.local.env') });
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../../app.module";
import { DataSource } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { Store } from '../domain/store.entity';
import { LocationEnum } from '../../store/location.enum';
import { StoreRepository } from '../domain/store.repository';
import { STORE_REPOSITORY } from '../../common/inject.constant';

describe('StoreRepository', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let storeRepository: StoreRepository;

    beforeAll(async () => {
        initializeTransactionalContext();

        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();

        dataSource = moduleRef.get<DataSource>(DataSource);
        storeRepository = moduleRef.get<StoreRepository>(STORE_REPOSITORY);
    });

    beforeEach(async () => {
        await dataSource.dropDatabase();
        await dataSource.synchronize();
    });

    describe('save()', () => {
        it('매장 엔티티를 저장한다.', async () => {
            const store = new Store({
                name: 'test store name',
                location: LocationEnum.KANGNAM,
                address: 'test store address',
                phoneNo: 'test store phoneNo',
                homepageUrl: 'test store homepageUrl'
            });
            await storeRepository.save(store);

            const foundStore = await storeRepository.findOneById(store.getId());
            expect(foundStore).toBeDefined();
            expect(foundStore?.getId()).toBeDefined();
            expect(foundStore?.getName()).toBe(store.getName());
        });
    });

    describe('findOneById()', () => {
        it('id로 매장을 찾는다.', async () => {
            const savedStore = await storeRepository.save(new Store({
                name: 'test store name',
                location: LocationEnum.KANGNAM,
                address: 'test store address',
                phoneNo: 'test store phoneNo',
                homepageUrl: 'test store homepageUrl'
            }));

            const result = await storeRepository.findOneById(1);
            expect(result?.getName()).toEqual(savedStore.getName());
        });
    });

    describe('find()', () => {
        let savedStore1: Store, savedStore2: Store;
        beforeEach(async () => {
            savedStore1 = await storeRepository.save(new Store({
                name: 'test store1 name',
                location: LocationEnum.KANGNAM,
                address: 'test store1 address',
                phoneNo: 'test store1 phoneNo',
                homepageUrl: 'test store1 homepageUrl'
            }));
            savedStore2 = await storeRepository.save(new Store({
                name: 'test store2 name',
                location: LocationEnum.HONGDAE,
                address: 'test store2 address',
                phoneNo: 'test store2 phoneNo',
                homepageUrl: 'test store2 homepageUrl'
            }));
        });

        it('전체 매장을 조회한다.', async () => {
            const result = await storeRepository.findAll();
            expect(result).toEqual([savedStore1, savedStore2]);
        });

        it('특정 지역으로 전체 매장을 조회한다.', async () => {
            const result = await storeRepository.findByLocation(LocationEnum.KANGNAM);
            expect(result).toEqual([savedStore1]);
        });

        it('특정 키워드로 전체 매장을 조회한다.', async () => {
            const result = await storeRepository.findByKeyword('store1');
            expect(result).toEqual([savedStore1]);
        });
    });

    afterAll(async () => {
        await app.close();
    });
})