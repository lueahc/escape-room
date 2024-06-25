import { LocationEnum } from "../location.enum";
import { Store } from "./store.entity";

export interface StoreRepository {
    findAll(): Promise<Store[]>;
    findByLocation(location: LocationEnum): Promise<Store[]>;
    findByKeyword(keyword: string): Promise<Store[]>;
    findOneById(id: number): Promise<Store | null>;
}