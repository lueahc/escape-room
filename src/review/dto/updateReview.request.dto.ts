import { ApiProperty } from "@nestjs/swagger";

export class UpdateReviewRequestDto {
    @ApiProperty({ description: '내용' })
    content: string;

    @ApiProperty({ description: '별점' })
    rate: number;

    @ApiProperty({ description: '활동성 점수' })
    activity: number;

    @ApiProperty({ description: '스토리 점수' })
    story: number;

    @ApiProperty({ description: '연출 점수' })
    dramatic: number;

    @ApiProperty({ description: '볼륨 점수' })
    volume: number;

    @ApiProperty({ description: '문제 퀄리티 점수' })
    problem: number;

    @ApiProperty({ description: '난이도 점수' })
    difficulty: number;

    @ApiProperty({ description: '공포도 점수' })
    horror: number;

    @ApiProperty({ description: '인테리어 점수' })
    interior: number;
}