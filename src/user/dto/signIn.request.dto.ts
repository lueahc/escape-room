import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class SignInRequestDto {
    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({ description: '이메일' })
    email: string;

    @IsNotEmpty()
    @ApiProperty({ description: '비밀번호' })
    password: string;
}