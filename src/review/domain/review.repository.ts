import { Review } from "./review.entity";

export interface ReviewRepository {
    save(review: Review): Promise<Review>;
    softDelete(id: number): Promise<void>;
    findOneById(id: number): Promise<Review | null>;
    findOneByUserIdAndRecordId(userId: number, recordId: number): Promise<Review | null>;
    countReviewsInRecord(recordId: number): Promise<number>;
    countVisibleReviewsInTheme(themeId: number): Promise<number>;
    countVisibleReviewsInStore(storeId: number): Promise<number>;
    getVisibleReviewsInTheme(themeId: number): Promise<Review[]>;
    getThreeVisibleReviewsInTheme(themeId: number): Promise<Review[]>;
}