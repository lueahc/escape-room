import { TimestampEntity } from "../../common/timestamp.entity"
import { User } from "../../user/domain/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Record } from "../../record/domain/record.entity";
import { UpdateReviewRequestDto } from "../dto/updateReview.request.dto";

@Entity()
export class Review extends TimestampEntity {
    @PrimaryGeneratedColumn()
    _id: number;

    @ManyToOne(() => User, (user) => user._reviews)
    @JoinColumn({ name: 'writer_id' })
    _writer: User;

    @ManyToOne(() => Record, (record) => record._reviews)
    @JoinColumn({ name: 'record_id' })
    _record: Record;

    @Column({ nullable: true })
    private content: string;

    @Column({ nullable: true })
    private rate: number;

    @Column({ nullable: true })
    private activity: number;

    @Column({ nullable: true })
    private story: number;

    @Column({ nullable: true })
    private dramatic: number;

    @Column({ nullable: true })
    private volume: number;

    @Column({ nullable: true })
    private problem: number;

    @Column({ nullable: true })
    private difficulty: number;

    @Column({ nullable: true })
    private horror: number;

    @Column({ nullable: true })
    private interior: number;

    static async create(params: { user: User, record: Record, content: string, rate: number, activity: number, story: number, dramatic: number, volume: number, problem: number, difficulty: number, horror: number, interior: number }): Promise<Review> {
        const { user, record, content, rate, activity, story, dramatic, volume, problem, difficulty, horror, interior } = params;
        const review = new Review();
        review._writer = user;
        review._record = record;
        review.content = content;
        review.rate = rate;
        review.activity = activity;
        review.story = story;
        review.dramatic = dramatic;
        review.volume = volume;
        review.problem = problem;
        review.difficulty = difficulty;
        review.horror = horror;
        review.interior = interior;
        return review;
    }

    public getId(): number {
        return this._id;
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
        return this._writer;
    }

    public getRecord(): Record {
        return this._record;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public updateReview(params: UpdateReviewRequestDto): void {
        const { content, rate, activity, story, dramatic, volume, problem, difficulty, horror, interior } = params;
        this.content = content;
        this.rate = rate;
        this.activity = activity;
        this.story = story;
        this.dramatic = dramatic;
        this.volume = volume;
        this.problem = problem;
        this.difficulty = difficulty;
        this.horror = horror;
        this.interior = interior;
    }

    public isNotWriter(userId: number): boolean {
        return userId !== this._writer.getId();
    }
}