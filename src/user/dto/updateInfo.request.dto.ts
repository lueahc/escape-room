import { IsNotEmpty } from "class-validator";

export class UpdateInfoRequestDto {
    password: string;

    nickname: string;
}