import { LocationEnum } from "../location.enum";

export class GetStoresListResponseDto {
    id: number;
    name: string;
    location: LocationEnum;
    reviewCount: number;

    constructor(params: {
        store: {
            id: number; name: string; location: LocationEnum;
        };
        reviewCount: number;
    }) {
        this.id = params.store.id;
        this.name = params.store.name;
        this.location = params.store.location;
        this.reviewCount = params.reviewCount;
    }
}