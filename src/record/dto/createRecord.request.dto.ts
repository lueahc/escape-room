import { IsNotEmpty } from "class-validator";

export class CreateRecordRequestDto {
    @IsNotEmpty()
    themeId: number;

    @IsNotEmpty()
    playDate: Date;

    @IsNotEmpty()
    isSuccess: boolean;

    @IsNotEmpty()
    headCount: number;

    hintCount: number;

    playTime: number;

    image: string;

    note: string;

    party: number[];
}