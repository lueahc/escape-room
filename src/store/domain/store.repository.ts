import { LocationEnum } from "../location.enum";
import { Store } from "./store.entity";

export interface StoreRepository {
    getAllStores(): Promise<Store[]>;
    getStoresByLocation(location: LocationEnum): Promise<Store[]>;
    getStoresByKeyword(keyword: string): Promise<Store[]>;
    getOneStoreById(id: number);
}