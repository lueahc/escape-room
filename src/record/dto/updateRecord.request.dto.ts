import { IsNotEmpty } from "class-validator";

export class UpdateRecordRequestDto {
    playDate: Date;

    isSuccess: boolean;

    @IsNotEmpty()
    headCount: number;

    hintCount: number;

    playTime: number;

    note: string;

    party: number[];
}