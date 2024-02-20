import { IsNotEmpty } from "class-validator";

export class CreateReviewRequestDto {
    @IsNotEmpty()
    recordId: number;

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
}