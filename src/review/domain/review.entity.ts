import { TimestampEntity } from "src/timestamp.entity"
import { User } from "src/user/domain/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Record } from "../../record/domain/record.entity";

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

    public getId(): number {
        return this.id;
    }

    public getContent(): string {
        return this.content;
    }

    public getRate(): number {
        return this.rate;
    }

    public getActivity(): number {
        return this.activity;
    }

    public getStory(): number {
        return this.story;
    }

    public getDramatic(): number {
        return this.dramatic;
    }

    public getVolume(): number {
        return this.volume;
    }

    public getProblem(): number {
        return this.problem;
    }

    public getDifficulty(): number {
        return this.difficulty;
    }

    public getHorror(): number {
        return this.horror;
    }

    public getInterior(): number {
        return this.interior;
    }

    public getWriter(): User {
        return this.writer;
    }

    public getRecord(): Record {
        return this.record;
    }
}