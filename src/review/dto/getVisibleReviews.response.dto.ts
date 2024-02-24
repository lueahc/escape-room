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
        r_id: number; nickname: string; store_name: string; theme_name: string; r2_play_date: Date;
        r2_is_success: number; r2_head_count: number; r2_hint_count: number; r2_play_time: number;
        r_content: string; r_rate: number; r_activity: number; r_story: number; r_dramatic: number; r_volume: number;
        r_problem: number; r_difficulty: number; r_horror: number; r_interior: number;
    }) {
        this.id = params.r_id;
        this.nickname = params.nickname;
        this.storeName = params.store_name;
        this.themeName = params.theme_name;
        this.playDate = params.r2_play_date;
        this.isSuccess = params.r2_is_success === 1;
        this.headCount = params.r2_head_count;
        this.hintCount = params.r2_hint_count;
        this.playTime = params.r2_play_time;
        this.content = params.r_content;
        this.rate = params.r_rate;
        this.activity = params.r_activity;
        this.story = params.r_story;
        this.dramatic = params.r_dramatic;
        this.volume = params.r_volume;
        this.problem = params.r_problem;
        this.difficulty = params.r_difficulty;
        this.horror = params.r_horror;
        this.interior = params.r_interior;
    }
}