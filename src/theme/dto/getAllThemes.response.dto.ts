import { LocationEnum } from "src/store/location.enum";

// class StoreDto {
//     name: string;
//     location: LocationEnum;

//     constructor(params: { name: string; location: LocationEnum; }) {
//         this.name = params.name;
//         this.location = params.location;
//     }
// }

export class GetAllThemesResponseDto {
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

    constructor(params: { theme: { id: number; name: string; image: string; plot: string; genre: string; time: number; level: number; price: number; note: string; store: { name: string; location: LocationEnum } }; reviewCount: number; }) {
        this.id = params.theme.id;
        this.storeName = params.theme.store.name;
        this.storeLocation = params.theme.store.location;
        this.themeName = params.theme.name;
        this.image = params.theme.image;
        this.plot = params.theme.plot;
        this.genre = params.theme.genre;
        this.time = params.theme.time;
        this.level = params.theme.level;
        this.price = params.theme.price;
        this.note = params.theme.note;
        //this.store = new StoreDto(params.store);
        this.reviewCount = params.reviewCount;
    }
}