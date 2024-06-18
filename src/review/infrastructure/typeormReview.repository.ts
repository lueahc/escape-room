import { Injectable } from "@nestjs/common";
import { ReviewRepository } from "../domain/review.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { Review } from "../domain/review.entity";
import { Repository } from "typeorm";

@Injectable()
export class TypeormReviewRepository implements ReviewRepository {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
    ) { }

    async save(review: Review): Promise<Review> {
        return await this.reviewRepository.save(review);
    }

    async softDelete(id: number): Promise<void> {
        await this.reviewRepository.softDelete(id);
    }

    async findOneById(id: number) {
        return await this.reviewRepository.findOne({
            where: {
                _id: id
            },
            relations: ['_writer']
        });
    }

    async findOneByUserIdAndRecordId(userId: number, recordId: number) {
        return await this.reviewRepository.findOne({
            where: {
                _writer: {
                    _id: userId
                },
                _record: {
                    _id: recordId
                }
            }
        });
    }

    async countReviewsInRecord(recordId: number): Promise<number> {
        return await this.reviewRepository.count({
            where: {
                _record: {
                    _id: recordId
                }
            }
        });
    }

    async countVisibleReviewsInTheme(themeId: number): Promise<number> {
        return await this.reviewRepository.count({
            where: {
                _record: {
                    _theme: {
                        _id: themeId
                    },
                    _tags: {
                        _visibility: true
                    }
                }
            },
            relations: ['_record._theme', '_record._tags']
        });
    }

    async countVisibleReviewsInStore(storeId: number): Promise<number> {
        return await this.reviewRepository.count({
            where: {
                _record: {
                    _theme: {
                        _store: {
                            _id: storeId
                        }
                    },
                    _tags: {
                        _visibility: true
                    }
                }
            },
            relations: ['_record._theme._store', '_record._tags']
        });
    }

    async getVisibleReviewsInTheme(themeId: number) {
        return await this.reviewRepository.find({
            where: {
                _record: {
                    _theme: {
                        _id: themeId
                    },
                    _tags: {
                        _visibility: true
                    }
                }
            },
            relations: ['_record._theme._store', '_writer', '_record._tags'],
            order: {
                createdAt: 'DESC'
            }
        });
    }

    async getThreeVisibleReviewsInTheme(themeId: number) {
        return await this.reviewRepository.find({
            where: {
                _record: {
                    _theme: {
                        _id: themeId
                    },
                    _tags: {
                        _visibility: true
                    }
                }
            },
            relations: ['_record._theme._store', '_writer', '_record._tags'],
            order: {
                createdAt: 'DESC'
            },
            take: 3
        });
    }
}