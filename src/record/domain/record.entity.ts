import { TimestampEntity } from "src/timestamp.entity"
import { User } from "src/user/domain/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Review } from "../../review/domain/review.entity";
import { Theme } from "src/theme/domain/theme.entity";
import { Tag } from "./tag.entity";

@Entity()
export class Record extends TimestampEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.records)
    public writer: User;

    @ManyToOne(() => Theme, (theme) => theme.records)
    public theme: Theme;

    @Column()
    playDate: Date;

    @Column()
    isSuccess: boolean;

    @Column()
    headCount: number;

    @Column({ nullable: true })
    hintCount: number;

    @Column({ nullable: true })
    playTime: number;

    @Column({ nullable: true })
    image: string;

    @Column({ nullable: true })
    note: string;

    @OneToMany(() => Review, (review) => review.record)
    public reviews: Review[];

    @OneToMany(() => Tag, (tag) => tag.record)
    public tags: Tag[];

    public getId(): number {
        return this.id;
    }

    public getPlayDate(): Date {
        return this.playDate;
    }

    public getIsSuccess(): boolean {
        return this.isSuccess;
    }

    public getHeadCount(): number {
        return this.headCount;
    }

    public getHintCount(): number {
        return this.hintCount;
    }

    public getPlayTime(): number {
        return this.playTime;
    }

    public getImage(): string {
        return this.image;
    }

    public getNote(): string {
        return this.note;
    }

    public getWriter(): User {
        return this.writer;
    }

    public getTheme(): Theme {
        return this.theme;
    }

    public getReviews(): Review[] {
        return this.reviews;
    }

    public getTags(): Tag[] {
        return this.tags;
    }
}