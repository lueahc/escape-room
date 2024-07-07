import { TimestampEntity } from "../../common/timestamp.entity"
import { User } from "../../user/domain/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Review } from "../../review/domain/review.entity";
import { Theme } from "../../theme/domain/theme.entity";
import { Tag } from "./tag.entity";

@Entity()
export class Record extends TimestampEntity {
    @PrimaryGeneratedColumn()
    _id: number;

    @ManyToOne(() => User, (user) => user._records)
    @JoinColumn({ name: 'writer_id' })
    _writer: User;

    @ManyToOne(() => Theme, (theme) => theme._records)
    @JoinColumn({ name: 'theme_id' })
    _theme: Theme;

    @Column()
    private playDate: Date;

    @Column()
    private isSuccess: boolean;

    @Column()
    private headCount: number;

    @Column({ nullable: true })
    private hintCount: number;

    @Column({ nullable: true })
    private playTime: number;

    @Column({ nullable: true })
    private image: string;

    @Column({ nullable: true })
    private note: string;

    @OneToMany(() => Review, (review) => review._record)
    _reviews: Review[];

    @OneToMany(() => Tag, (tag) => tag._record)
    _tags: Tag[];

    static async create(params: { user: User, theme: Theme, isSuccess: boolean, playDate: Date, headCount: number, hintCount: number, playTime: number, image: string, note: string }): Promise<Record> {
        const { user, theme, isSuccess, playDate, headCount, hintCount, playTime, image, note } = params;
        const record = new Record();
        record._writer = user;
        record._theme = theme;
        record.isSuccess = isSuccess;
        record.playDate = playDate;
        record.headCount = headCount;
        record.hintCount = hintCount;
        record.playTime = playTime;
        record.image = image;
        record.note = note;
        return record;
    }

    public getId(): number {
        return this._id;
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
        return this._writer;
    }

    public getTheme(): Theme {
        return this._theme;
    }

    public getReviews(): Review[] {
        return this._reviews;
    }

    public getTags(): Tag[] {
        return this._tags;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public isNotWriter(userId: number): boolean {
        return userId !== this._writer.getId();
    }

    public updateRecord(params: { isSuccess: boolean, playDate: Date, headCount: number, hintCount: number, playTime: number, image: string, note: string }): void {
        const { isSuccess, playDate, headCount, hintCount, playTime, image, note } = params;
        this.isSuccess = isSuccess;
        this.playDate = playDate;
        this.headCount = headCount;
        this.hintCount = hintCount;
        this.playTime = playTime;
        this.image = image;
        this.note = note;
    }
}