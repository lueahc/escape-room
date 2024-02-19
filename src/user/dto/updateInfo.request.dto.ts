import { IsNotEmpty } from "class-validator";

export class UpdateInfoRequestDto {
    @IsNotEmpty()
    nickname: string;
}