import { Review } from "../../domain/review.entity";

export class GetVisibleReviewsResponseDto {
    id: number;
    nickname: string;
    storeName: string;
    themeName: string;
    playDate: Date;
    isSuccess: boolean;
    headCount: number;
    hintCount: number;
    playTime: number;
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
        this.nickname = review.getWriter().getNickname();
        this.storeName = review.getRecord().getTheme().getStore().getName();
        this.themeName = review.getRecord().getTheme().getName();
        this.playDate = review.getRecord().getPlayDate();
        this.isSuccess = review.getRecord().getIsSuccess();
        this.headCount = review.getRecord().getHeadCount();
        this.hintCount = review.getRecord().getHintCount();
        this.playTime = review.getRecord().getPlayTime();
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