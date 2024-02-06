import { TimestampEntity } from "src/timestamp.entity"
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}