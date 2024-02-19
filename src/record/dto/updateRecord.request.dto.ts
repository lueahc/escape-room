import { IsNotEmpty } from "class-validator";

export class UpdateRecordRequestDto {
    themeId: number;

    isSuccess: boolean;

    playDate: Date;

    @IsNotEmpty()
    headCount: number;

    hintCount: number;

    playTime: number;

    image: string;

    party: number[];
}