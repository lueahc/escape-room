import { TimestampEntity } from "src/timestamp.entity"
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Store } from "../../store/domain/store.entity";
import { Record } from "src/record/domain/record.entity";

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

    @Column({ nullable: true })
    note: string;

    @ManyToOne(() => Store, (store) => store.themes)
    public store: Store;

    @OneToMany(() => Record, (record) => record.theme)
    public records: Record[];

    public getId(): number {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getImage(): string {
        return this.image;
    }

    public getPlot(): string {
        return this.plot;
    }

    public getGenre(): string {
        return this.genre;
    }

    public getTime(): number {
        return this.time;
    }

    public getLevel(): number {
        return this.level;
    }

    public getPrice(): number {
        return this.price;
    }

    public getNote(): string {
        return this.note;
    }

    public getStore(): Store {
        return this.store;
    }

    public getRecords(): Record[] {
        return this.records;
    }
}