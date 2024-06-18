import { Review } from "./review.entity";

export interface ReviewRepository {
    save(review: Review): Promise<Review>;
    softDelete(id: number): Promise<void>;
    findOneById(id: number);
    findOneByUserIdAndRecordId(userId: number, recordId: number);
    countReviewsInRecord(recordId: number): Promise<number>;
    countVisibleReviewsInTheme(themeId: number): Promise<number>;
    countVisibleReviewsInStore(storeId: number): Promise<number>;
    getVisibleReviewsInTheme(themeId: number);
    getThreeVisibleReviewsInTheme(themeId: number);
}