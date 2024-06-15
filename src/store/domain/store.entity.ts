import { TimestampEntity } from "src/timestamp.entity"
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Theme } from "src/theme/domain/theme.entity";
import { LocationEnum } from "../location.enum";

@Entity()
export class Store extends TimestampEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    location: LocationEnum;

    @Column()
    address: string;

    @Column()
    phoneNo: string;

    @Column()
    homepageUrl: string;

    @OneToMany(() => Theme, (theme) => theme.store)
    public themes: Theme[];

    public getId(): number {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getLocation(): LocationEnum {
        return this.location;
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
        return this.themes;
    }
}