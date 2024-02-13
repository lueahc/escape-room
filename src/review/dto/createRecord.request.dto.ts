import { IsEmail, IsNotEmpty } from "class-validator";

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

    //public reviews: Review[];
}