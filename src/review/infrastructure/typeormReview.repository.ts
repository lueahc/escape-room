import { Injectable } from "@nestjs/common";
import { ReviewRepository } from "../domain/review.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { Review } from "../domain/review.entity";
import { Repository, SelectQueryBuilder } from "typeorm";

@Injectable()
export class TypeormReviewRepository implements ReviewRepository {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
    ) { }

    async getReviewById(id: number) {
        return await this.reviewRepository.findOne({
            relations: {
                writer: true
            },
            where: {
                id
            }
        });
    }

    async getOneReviewByUserIdAndRecordId(userId: number, recordId: number) {
        return await this.reviewRepository.findOne({
            relations: {
                writer: true
            },
            where: {
                writer: {
                    _id: userId
                },
                record: {
                    id: recordId
                }
            }
        });
    }

    create(review: Partial<Review>): Review {
        return this.reviewRepository.create(review);
    }

    async save(review: Review): Promise<Review> {
        return await this.reviewRepository.save(review);
    }

    async softDelete(id: number): Promise<void> {
        await this.reviewRepository.softDelete(id);
    }

    async countReviewsInRecord(recordId: number): Promise<number> {
        return await this.reviewRepository
            .createQueryBuilder('review')
            .where('review.record_id = :recordId', { recordId })
            .getCount();
    }

    async countVisibleReviewsInTheme(themeId: number): Promise<number> {
        return await this.reviewRepository.createQueryBuilder('r')
            .leftJoin('record', 'r2', 'r.record_id = r2.id')
            .leftJoin('tag', 't', 't.record_id = r.record_id and r.writer__id = t.user__id')
            .addSelect('r.id', 'id')
            .where('r2.theme_id = :themeId and t.visibility = true', { themeId })
            .getCount();
    }

    async countVisibleReviewsInStore(storeId: number): Promise<number> {
        return await this.reviewRepository.createQueryBuilder('r')
            .leftJoin('record', 'r2', 'r.record_id = r2.id')
            .leftJoin('theme', 't', 'r2.theme_id = t.id')
            .leftJoin('tag', 't2', 't2.record_id = r.record_id and r.writer__id = t2.user__id')
            .addSelect('r.id', 'id')
            .where('t.store_id = :storeId and t2.visibility = true', { storeId })
            .getCount();
    }

    async getVisibleReviewsInTheme(themeId: number) {
        return await this.reviewRepository.createQueryBuilder('r')
            .leftJoinAndSelect('record', 'r2', 'r.record_id = r2.id')
            .leftJoinAndSelect('user', 'u', 'u.id = r.writer__id')
            .leftJoin('theme', 't', 'r2.theme_id = t.id')
            .leftJoin('store', 's', 't.store_id = s.id')
            .leftJoinAndSelect('tag', 't2', 't2.record_id = r.record_id and r.writer__id = t2.user__id')
            .addSelect('u._nickname', 'nickname')
            .addSelect('s.name', 'store_name')
            .addSelect('t.name', 'theme_name')
            .where('t2.visibility = true and t.id = :themeId', { themeId })
            .orderBy('r.created_at', 'DESC')
            .getRawMany();
    }

    async getThreeVisibleReviewsInTheme(themeId: number) {
        return await this.reviewRepository.createQueryBuilder('r')
            .leftJoinAndSelect('record', 'r2', 'r.record_id = r2.id')
            .leftJoinAndSelect('user', 'u', 'u.id = r.writer__id')
            .leftJoin('theme', 't', 'r2.theme_id = t.id')
            .leftJoin('store', 's', 't.store_id = s.id')
            .leftJoinAndSelect('tag', 't2', 't2.record_id = r.record_id and r.writer__id = t2.user__id')
            .addSelect('u._nickname', 'nickname')
            .addSelect('s.name', 'store_name')
            .addSelect('t.name', 'theme_name')
            .where('t2.visibility = true and t.id = :themeId', { themeId })
            .orderBy('r.created_at', 'DESC')
            .limit(3)
            .getRawMany();
    }
}