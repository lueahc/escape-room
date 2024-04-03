import { TimestampEntity } from "../timestamp.entity"
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Theme } from "../theme/theme.entity";
import { LocationEnum } from "./location.enum";

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
}