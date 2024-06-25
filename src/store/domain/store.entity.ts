import { TimestampEntity } from "src/common/timestamp.entity"
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Theme } from "src/theme/domain/theme.entity";
import { LocationEnum } from "../location.enum";

@Entity()
export class Store extends TimestampEntity {
    @PrimaryGeneratedColumn()
    _id: number;

    @Column()
    _name: string;

    @Column()
    _location: LocationEnum;

    @Column()
    private address: string;

    @Column()
    private phoneNo: string;

    @Column()
    private homepageUrl: string;

    @OneToMany(() => Theme, (theme) => theme._store)
    _themes: Theme[];

    public getId(): number {
        return this._id;
    }

    public getName(): string {
        return this._name;
    }

    public getLocation(): LocationEnum {
        return this._location;
    }

    public getAddress(): string {
        return this.address;
    }

    public getPhoneNo(): string {
        return this.phoneNo;
    }

    public getHomepageUrl(): string {
        return this.homepageUrl;
    }

    public getThemes(): Theme[] {
        return this._themes;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }
}