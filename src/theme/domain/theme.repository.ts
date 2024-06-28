import { LocationEnum } from "../../store/location.enum";
import { Theme } from "./theme.entity";

export interface ThemeRepository {
    findOneById(id: number): Promise<Theme | null>;
    findAll(): Promise<Theme[]>;
    findByLocation(location: LocationEnum): Promise<Theme[]>;
    findByKeyword(keword: string): Promise<Theme[]>;
    findByStoreId(storeId: number): Promise<Theme[]>;
}