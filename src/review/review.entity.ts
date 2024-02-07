import { TimestampEntity } from "src/timestamp.entity"
import { User } from "src/user/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Record } from "./record.entity";

@Entity()
export class Review extends TimestampEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.reviews)
    public writer: User;

    @ManyToOne(() => Record, (record) => record.reviews)
    public record: Record;

    @Column()
    content: string;

    @Column()
    rate: number;

    @Column()
    difficulty: number;

    @Column()
    horror: number;

    @Column()
    activity: number;

    @Column()
    dramatic: number;

    @Column()
    story: number;

    @Column()
    problem: number;

    @Column()
    interior: number;
}