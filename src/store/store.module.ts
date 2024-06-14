import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './domain/store.entity';
import { ReviewModule } from 'src/review/review.module';
import { ThemeModule } from 'src/theme/theme.module';
import { TypeormStoreRepository } from './infrastructure/typeormStore.repository';
import { STORE_REPOSITORY } from 'src/inject.constant';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store]),
    ReviewModule,
    ThemeModule
  ],
  controllers: [StoreController],
  providers: [
    StoreService,
    { provide: STORE_REPOSITORY, useClass: TypeormStoreRepository },
  ],
  exports: [StoreService],
})
export class StoreModule { }
