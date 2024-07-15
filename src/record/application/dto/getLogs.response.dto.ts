import { Record } from "../../domain/record.entity";

export class GetLogsResponseDto {
    id: number;
    playDate: Date;
    storeName: string;
    themeName: string;
    isSuccess: boolean;

    constructor(record: Record) {
        this.id = record.getId();
        this.playDate = record.getPlayDate();
        this.storeName = record.getTheme().getStore().getName();
        this.themeName = record.getTheme().getName();
        this.isSuccess = record.getIsSuccess();
    }
}