import { TimestampEntity } from "src/timestamp.entity"
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Review extends TimestampEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    playDate: Date;

    @Column()
    headCount: number;

    @Column()
    successFlag: number;

    @Column()
    content: string;
}