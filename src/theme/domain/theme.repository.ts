import { LocationEnum } from "../../store/domain/location.enum";
import { Theme } from "./theme.entity";

export interface ThemeRepository {
    save(theme: Theme): Promise<Theme>;
    findOneById(id: number): Promise<Theme | null>;
    findAll(): Promise<Theme[]>;
    findByLocation(location: LocationEnum): Promise<Theme[]>;
    findByKeyword(keword: string): Promise<Theme[]>;
    findByStoreId(storeId: number): Promise<Theme[]>;
}