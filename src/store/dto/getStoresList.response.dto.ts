import { LocationEnum } from "src/store/location.enum";

export class GetStoresListResponseDto {
    id: number;
    name: string;
    location: LocationEnum;
    address: string;
    phoneNo: string;
    homepageUrl: string;
    reviewCount: number;

    constructor(params: { store: { id: number; name: string; location: LocationEnum; address: string; phoneNo: string; homepageUrl: string; }; reviewCount: number; }) {
        this.id = params.store.id;
        this.name = params.store.name;
        this.location = params.store.location;
        this.address = params.store.address;
        this.phoneNo = params.store.phoneNo;
        this.homepageUrl = params.store.homepageUrl;
        this.reviewCount = params.reviewCount;
    }
}