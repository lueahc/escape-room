import { TimestampEntity } from "../../common/timestamp.entity"
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Store } from "../../store/domain/store.entity";
import { Record } from "../../record/domain/record.entity";

@Entity()
export class Theme extends TimestampEntity {
    @PrimaryGeneratedColumn()
    _id: number;

    @Column()
    _name: string;

    @Column()
    private image: string;

    @Column()
    private plot: string;

    @Column()
    private genre: string;

    @Column()
    private time: number;

    @Column()
    private level: number;

    @Column()
    private price: number;

    @Column({ nullable: true })
    private note: string;

    @ManyToOne(() => Store, (store) => store._themes)
    @JoinColumn({ name: 'store_id' })
    _store: Store;

    @OneToMany(() => Record, (record) => record._theme)
    _records: Record[];

    constructor(params: { name: string, image: string, plot: string, genre: string, time: number, level: number, price: number, note: string, store: Store }) {
        super();
        if (params) {
            const { name, image, plot, genre, time, level, price, note, store } = params;
            this._name = name;
            this.image = image;
            this.plot = plot;
            this.genre = genre;
            this.time = time;
            this.level = level;
            this.price = price;
            this.note = note;
            this._store = store;
        }
    }

    public getId(): number {
        return this._id;
    }

    public getName(): string {
        return this._name;
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
        return this._store;
    }

    public getRecords(): Record[] {
        return this._records;
    }
}