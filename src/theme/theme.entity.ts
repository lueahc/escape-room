import { TimestampEntity } from "src/timestamp.entity"
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Store } from "./store.entity";
import { Record } from "src/review/record.entity";

@Entity()
export class Theme extends TimestampEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    plot: string;

    @Column()
    image: string;

    @Column()
    price: number;

    @Column()
    time: number;

    @ManyToOne(() => Store, (store) => store.themes)
    public store: Store;

    @OneToMany(() => Record, (record) => record.theme)
    public records: Record[];
}