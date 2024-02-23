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

    constructor(params: {
        id: number; nickname: string; store_name: string; theme_name: string; play_date: Date;
        is_success: number; head_count: number; hint_count: number; play_time: number;
        content: string; rate: number; activity: number; story: number; dramatic: number; volume: number;
        problem: number; difficulty: number; horror: number; interior: number;
    }) {
        this.id = params.id;
        this.nickname = params.nickname;
        this.storeName = params.store_name;
        this.themeName = params.theme_name;
        this.playDate = params.play_date;
        this.isSuccess = params.is_success === 1;
        this.headCount = params.head_count;
        this.hintCount = params.hint_count;
        this.playTime = params.play_time;
        this.content = params.content;
        this.rate = params.rate;
        this.activity = params.activity;
        this.story = params.story;
        this.dramatic = params.dramatic;
        this.volume = params.volume;
        this.problem = params.problem;
        this.difficulty = params.difficulty;
        this.horror = params.horror;
        this.interior = params.interior;
    }
}