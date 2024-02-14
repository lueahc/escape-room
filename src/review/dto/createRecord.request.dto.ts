import { IsNotEmpty } from "class-validator";

export class CreateRecordRequestDto {
    @IsNotEmpty()
    themeId: number;

    @IsNotEmpty()
    isSuccess: boolean;

    playDate: Date;

    headCount: number;

    hintCount: number;

    leftPlayTime: number;

    image: string;

    content: string;

    rate: number;

    difficulty: number;

    horror: number;

    activity: number;

    dramatic: number;

    story: number;

    problem: number;

    interior: number;
}