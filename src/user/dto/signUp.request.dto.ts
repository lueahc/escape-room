import { IsEmail, IsNotEmpty } from "class-validator";

export class SignUpRequestDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    nickname: string;
}