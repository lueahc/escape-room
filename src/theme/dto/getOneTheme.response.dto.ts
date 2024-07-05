import { GetVisibleReviewsResponseDto } from "../../review/dto/getVisibleReviews.response.dto";
import { LocationEnum } from "../../store/location.enum";
import { Theme } from "../domain/theme.entity";

export class GetOneThemeResponseDto {
    id: number;
    themeName: string;
    image: string;
    plot: string;
    genre: string;
    time: number;
    level: number;
    price: number;
    note: string;
    themeReviewCount: number;
    storeId: number;
    storeName: string;
    storeLocation: LocationEnum;
    storeAddress: string;
    storePhoneNo: string;
    storeHomePageUrl: string;
    storeReviewCount: number;
    reviews: GetVisibleReviewsResponseDto[];

    constructor(params: {
        theme: Theme;
        themeReviewCount: number;
        storeReviewCount: number;
        reviews: GetVisibleReviewsResponseDto[];
    }) {
        const { theme, themeReviewCount, storeReviewCount, reviews } = params;
        this.id = theme.getId();
        this.themeName = theme.getName();
        this.image = theme.getImage();
        this.plot = theme.getPlot();
        this.genre = theme.getGenre();
        this.time = theme.getTime();
        this.level = theme.getLevel();
        this.price = theme.getPrice();
        this.note = theme.getNote();
        this.themeReviewCount = themeReviewCount;

        const store = theme.getStore();
        this.storeId = store.getId();
        this.storeName = store.getName();
        this.storeLocation = store.getLocation();
        this.storeAddress = store.getAddress();
        this.storePhoneNo = store.getPhoneNo();
        this.storeHomePageUrl = store.getHomepageUrl();
        this.storeReviewCount = storeReviewCount;
        this.reviews = reviews;
    }
}