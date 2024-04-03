import { GetVisibleReviewsResponseDto } from "../../review/dto/getVisibleReviews.response.dto";
import { LocationEnum } from "../../store/location.enum";

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
        theme: {
            id: number; name: string; image: string; plot: string; genre: string; time: number; level: number; price: number; note: string;
            store: { id: number; name: string; location: LocationEnum; address: string; phoneNo: string; homepageUrl: string; }
        };
        themeReviewCount: number; storeReviewCount: number; reviews: GetVisibleReviewsResponseDto[];
    }) {
        this.id = params.theme.id;
        this.themeName = params.theme.name;
        this.image = params.theme.image;
        this.plot = params.theme.plot;
        this.genre = params.theme.genre;
        this.time = params.theme.time;
        this.level = params.theme.level;
        this.price = params.theme.price;
        this.note = params.theme.note;
        this.themeReviewCount = params.themeReviewCount;
        this.storeId = params.theme.store.id;
        this.storeName = params.theme.store.name;
        this.storeLocation = params.theme.store.location;
        this.storeAddress = params.theme.store.address;
        this.storePhoneNo = params.theme.store.phoneNo;
        this.storeHomePageUrl = params.theme.store.homepageUrl;
        this.storeReviewCount = params.storeReviewCount;
        this.reviews = params.reviews;
    }
}