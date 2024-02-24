import { LocationEnum } from "src/store/location.enum";
import { GetThemesListResponseDto } from "src/theme/dto/getThemesList.response.dto";

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
        store: {
            id: number; name: string; location: LocationEnum; address: string; phoneNo: string; homepageUrl: string;
        };
        reviewCount: number; themes: GetThemesListResponseDto[];
    }) {
        this.id = params.store.id;
        this.name = params.store.name;
        this.location = params.store.location;
        this.address = params.store.address;
        this.phoneNo = params.store.phoneNo;
        this.homepageUrl = params.store.homepageUrl;
        this.reviewCount = params.reviewCount;
        this.themes = params.themes;
    }
}