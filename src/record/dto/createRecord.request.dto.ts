import { IsNotEmpty } from "class-validator";

export class CreateRecordRequestDto {
    @IsNotEmpty()
    themeId: number;

    @IsNotEmpty()
    isSuccess: boolean;

    @IsNotEmpty()
    playDate: Date;

    @IsNotEmpty()
    headCount: number;

    hintCount: number;

    playTime: number;

    image: string;

    party: number[];
}