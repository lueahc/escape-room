export class GetLogsResponseDto {
    id: number;
    playDate: Date;
    storeName: string;
    themeName: string;
    isSuccess: boolean;

    constructor(params: { id: number; play_date: Date; store_name: string; theme_name: string; is_success: number }) {
        this.id = params.id;
        this.playDate = params.play_date;
        this.storeName = params.store_name;
        this.themeName = params.theme_name;
        this.isSuccess = params.is_success === 1;
    }
}