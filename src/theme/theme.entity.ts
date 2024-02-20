import { TimestampEntity } from "src/timestamp.entity"
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Store } from "../store/store.entity";
import { Record } from "src/record/record.entity";

@Entity()
export class Theme extends TimestampEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    image: string;

    @Column()
    plot: string;

    @Column()
    genre: string;

    @Column()
    time: number;

    @Column()
    level: number;

    @Column()
    price: number;

    @Column()
    note: string;

    @ManyToOne(() => Store, (store) => store.themes)
    public store: Store;

    @OneToMany(() => Record, (record) => record.theme)
    public records: Record[];
}