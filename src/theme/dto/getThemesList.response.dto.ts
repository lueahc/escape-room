import { LocationEnum } from "../../store/location.enum";
import { Theme } from "../domain/theme.entity";

export class GetThemesListResponseDto {
    id: number;
    storeName: string;
    storeLocation: LocationEnum;
    themeName: string;
    image: string;
    plot: string;
    genre: string;
    time: number;
    level: number;
    price: number;
    note: string;
    reviewCount: number;

    constructor(params: {
        theme: Theme;
        reviewCount: number;
    }) {
        const { theme, reviewCount } = params;
        this.id = theme.getId();
        this.storeName = theme.getStore().getName();
        this.storeLocation = theme.getStore().getLocation();
        this.themeName = theme.getName();
        this.image = theme.getImage();
        this.plot = theme.getPlot();
        this.genre = theme.getGenre();
        this.time = theme.getTime();
        this.level = theme.getLevel();
        this.price = theme.getPrice();
        this.note = theme.getNote();
        this.reviewCount = reviewCount;
    }
}