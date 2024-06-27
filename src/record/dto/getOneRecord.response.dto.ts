import { Record } from "../domain/record.entity";
import { GetRecordReviewsResponseDto } from "./getRecordReviews.response.dto";

export class GetOneRecordResponseDto {
    id: number;
    writer: {
        id: number;
        nickname: string;
    }
    theme: {
        id: number;
        name: string;
        store: {
            id: number;
            name: string;
        }
    }
    isSuccess: boolean;
    playDate: Date;
    headCount: number;
    hintCount: number;
    playTime: number;
    image: string;
    note: string;
    reviews: GetRecordReviewsResponseDto[];

    constructor(params: {
        record: Record,
        reviews: GetRecordReviewsResponseDto[]
    }) {
        const { record, reviews } = params;
        this.id = record.getId();
        this.writer = {
            id: record.getWriter().getId(),
            nickname: record.getWriter().getNickname(),
        };
        this.theme = {
            id: record.getTheme().getId(),
            name: record.getTheme().getName(),
            store: {
                id: record.getTheme().getStore().getId(),
                name: record.getTheme().getStore().getName()
            }
        };
        this.isSuccess = record.getIsSuccess();
        this.playDate = record.getPlayDate();
        this.headCount = record.getHeadCount();
        this.hintCount = record.getHintCount();
        this.playTime = record.getPlayTime();
        this.image = record.getImage();
        this.note = record.getNote();
        this.reviews = reviews;
    }
}