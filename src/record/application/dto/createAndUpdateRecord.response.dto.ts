import { Record } from "../../domain/record.entity";

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
    playDate: Date;
    headCount: number;
    hintCount: number;
    playTime: number;
    image: string;
    note: string;

    constructor(record: Record) {
        this.id = record.getId();
        this.writer = {
            id: record.getWriter().getId(),
            nickname: record.getWriter().getNickname(),
        };
        this.theme = {
            id: record.getTheme().getId(),
            name: record.getTheme().getName(),
            store: {
                id: record.getTheme().getStore().getId(),
                name: record.getTheme().getStore().getName()
            }
        };
        this.isSuccess = record.getIsSuccess();
        this.playDate = record.getPlayDate();
        this.headCount = record.getHeadCount();
        this.hintCount = record.getHintCount();
        this.playTime = record.getPlayTime();
        this.image = record.getImage();
        this.note = record.getNote()
    }
}