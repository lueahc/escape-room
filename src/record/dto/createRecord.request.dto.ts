import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateRecordRequestDto {
    @IsNotEmpty()
    @ApiProperty({ description: '테마 ID' })
    themeId: number;

    @IsNotEmpty()
    @ApiProperty({ description: '플레이 날짜' })
    playDate: Date;

    @IsNotEmpty()
    @ApiProperty({ description: '탈출 여부' })
    isSuccessStr: string;

    @IsNotEmpty()
    @ApiProperty({ description: '플레이 인원 수' })
    headCount: number;

    @ApiProperty({ description: '사용 힌트 수' })
    hintCount: number;

    @ApiProperty({ description: '플레이 시간' })
    playTime: number;

    @ApiProperty({ description: '비고' })
    note: string;

    @ApiProperty({ description: '일행 태그' })
    party: number[];

    @ApiProperty({ description: '이미지 파일', type: 'string', format: 'binary' })
    file: Express.Multer.File
}