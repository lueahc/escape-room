import { LocationEnum } from '../../store/domain/location.enum';
import { Theme } from '../domain/theme.entity';
import { ThemeRepository } from '../domain/theme.repository';

export class TestThemeRepository implements ThemeRepository {
  private nextId = 1;
  private themes: Theme[] = [];

  async save(theme: Theme): Promise<Theme> {
    theme.setId(this.nextId++);
    this.themes.push(theme);
    return theme;
  }

  async findOneById(id: number): Promise<Theme | null> {
    return this.themes.find((theme) => theme._id === id) || null;
  }

  async findAll(): Promise<Theme[]> {
    return this.themes;
  }

  async findByLocation(location: LocationEnum): Promise<Theme[]> {
    return this.themes.filter(
      (theme) => theme.getStore().getLocation() === location,
    );
  }

  async findByKeyword(keyword: string): Promise<Theme[]> {
    return this.themes.filter((theme) => theme.getName().includes(keyword));
  }

  async findByStoreId(storeId: number): Promise<Theme[]> {
    return this.themes.filter((theme) => theme.getStore().getId() === storeId);
  }

  reset() {
    this.nextId = 1;
    this.themes = [];
  }
}
