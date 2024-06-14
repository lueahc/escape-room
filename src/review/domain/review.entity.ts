import { TimestampEntity } from "src/timestamp.entity"
import { User } from "src/user/domain/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Record } from "../../record/record.entity";

@Entity()
export class Review extends TimestampEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.reviews)
    public writer: User;

    @ManyToOne(() => Record, (record) => record.reviews)
    public record: Record;

    @Column({ nullable: true })
    content: string;

    @Column({ nullable: true })
    rate: number;

    @Column({ nullable: true })
    activity: number;

    @Column({ nullable: true })
    story: number;

    @Column({ nullable: true })
    dramatic: number;

    @Column({ nullable: true })
    volume: number;

    @Column({ nullable: true })
    problem: number;

    @Column({ nullable: true })
    difficulty: number;

    @Column({ nullable: true })
    horror: number;

    @Column({ nullable: true })
    interior: number;
}