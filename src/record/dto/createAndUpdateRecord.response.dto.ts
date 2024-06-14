import { IsDateString } from "class-validator";

export class CreateAndUpdateRecordResponseDto {
    id: number;
    writer: {
        id: number;
        nickname: string;
    }
    theme: {
        id: number;
        name: string;
        store: {
            id: number;
            name: string;
        }
    }
    isSuccess: boolean;
    @IsDateString()
    playDate: Date;
    headCount: number;
    hintCount: number;
    playTime: number;
    image: string;
    note: string;

    constructor(params: {
        id: number;
        writer: { _id: number; _nickname: string; };
        theme: { id: number; name: string; store: { id: number; name: string; } };
        isSuccess: boolean; playDate: Date; headCount: number; hintCount: number; playTime: number; image: string; note: string;
    }) {
        this.id = params.id;
        this.writer = {
            id: params.writer._id,
            nickname: params.writer._nickname
        };
        this.theme = {
            id: params.theme.id,
            name: params.theme.name,
            store: {
                id: params.theme.store.id,
                name: params.theme.store.name
            }
        };
        this.isSuccess = params.isSuccess;
        this.playDate = params.playDate;
        this.headCount = params.headCount;
        this.hintCount = params.hintCount;
        this.playTime = params.playTime;
        this.image = params.image;
        this.note = params.note;
    }
}