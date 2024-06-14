import { LocationEnum } from "src/store/location.enum";
import { Theme } from "./theme.entity";

export interface ThemeRepository {
    getThemeById(id: number);
    getAllThemes(): Promise<Theme[]>;
    getThemesByLocation(location: LocationEnum): Promise<Theme[]>;
    getThemesByKeyword(keword: string): Promise<Theme[]>;
    getThemesByStoreId(storeId: number): Promise<Theme[]>;
}