import { LocationEnum } from '../../store/domain/location.enum';
import { Store } from '../domain/store.entity';
import { StoreRepository } from '../domain/store.repository';

export class TestStoreRepository implements StoreRepository {
  private nextId = 1;
  private stores: Store[] = [];

  async save(store: Store): Promise<Store> {
    store.setId(this.nextId++);
    this.stores.push(store);
    return store;
  }

  async findOneById(id: number): Promise<Store | null> {
    return this.stores.find((store) => store.getId() === id) || null;
  }

  async findAll(): Promise<Store[]> {
    return this.stores;
  }

  async findByLocation(location: LocationEnum): Promise<Store[]> {
    return this.stores.filter((store) => store.getLocation() === location);
  }

  async findByKeyword(keyword: string): Promise<Store[]> {
    return this.stores.filter((store) => store.getName().includes(keyword));
  }

  reset() {
    this.nextId = 1;
    this.stores = [];
  }
}
