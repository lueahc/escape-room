import { TimestampEntity } from "src/timestamp.entity"
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Theme } from "./theme.entity";

@Entity()
export class Store extends TimestampEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    phoneNo: string;

    @Column()
    location: string;

    @Column()
    address: string;

    @Column()
    homepageUrl: string;

    @OneToMany(() => Theme, (theme) => theme.store)
    public themes: Theme[];
}