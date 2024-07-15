import { LocationEnum } from "../../domain/location.enum";
import { GetThemesListResponseDto } from "../../../theme/application/dto/getThemesList.response.dto";
import { Store } from "../../domain/store.entity";

export class GetOneStoreResponseDto {
    id: number;
    name: string;
    location: LocationEnum;
    address: string;
    phoneNo: string;
    homepageUrl: string;
    reviewCount: number;
    themes: GetThemesListResponseDto[];

    constructor(params: {
        store: Store;
        reviewCount: number;
        themes: GetThemesListResponseDto[];
    }) {
        const { store, reviewCount, themes } = params;
        this.id = store.getId();
        this.name = store.getName();
        this.location = store.getLocation();
        this.address = store.getAddress();
        this.phoneNo = store.getPhoneNo();
        this.homepageUrl = store.getHomepageUrl();
        this.reviewCount = reviewCount;
        this.themes = themes;
    }
}