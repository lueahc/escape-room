import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdateInfoRequestDto {
    @ApiProperty({ description: '비밀번호' })
    password: string;

    @ApiProperty({ description: '닉네임' })
    nickname: string;
}