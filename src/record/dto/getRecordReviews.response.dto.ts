import { Review } from "../../review/domain/review.entity";

export class GetRecordReviewsResponseDto {
    id: number;
    writer: {
        id: number;
        nickname: string;
    }
    content: string;
    rate: number;
    activity: number;
    story: number;
    dramatic: number;
    volume: number;
    problem: number;
    difficulty: number;
    horror: number;
    interior: number;

    constructor(review: Review) {
        this.id = review.getId();
        this.writer = {
            id: review.getWriter().getId(),
            nickname: review.getWriter().getNickname(),
        };
        this.content = review.getContent();
        this.rate = review.getRate();
        this.activity = review.getActivity();
        this.story = review.getStory();
        this.dramatic = review.getDramatic();
        this.volume = review.getVolume();
        this.problem = review.getProblem();
        this.difficulty = review.getDifficulty();
        this.horror = review.getHorror();
        this.interior = review.getInterior();
    }
}