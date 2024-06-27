import { LocationEnum } from "src/store/location.enum";
import { Store } from "../domain/store.entity";

export class GetStoresListResponseDto {
    id: number;
    name: string;
    location: LocationEnum;
    reviewCount: number;

    constructor(params: {
        store: Store;
        reviewCount: number;
    }) {
        const { store, reviewCount } = params;
        this.id = store.getId();
        this.name = store.getName();
        this.location = store.getLocation();
        this.reviewCount = reviewCount;
    }
}