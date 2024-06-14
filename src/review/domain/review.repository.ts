import { SelectQueryBuilder } from "typeorm";
import { Review } from "./review.entity";

export interface ReviewRepository {
    getReviewById(id: number);
    getOneReviewByUserIdAndRecordId(userId: number, recordId: number);
    create(review: Partial<Review>): Review;
    save(review: Review): Promise<Review>;
    softDelete(id: number): Promise<void>;
    countReviewsInRecord(recordId: number): Promise<number>;
    countVisibleReviewsInTheme(themeId: number): Promise<number>;
    countVisibleReviewsInStore(storeId: number): Promise<number>;
    getVisibleReviewsInTheme(themeId: number);
    getThreeVisibleReviewsInTheme(themeId: number);
}