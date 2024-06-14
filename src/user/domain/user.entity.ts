import { TimestampEntity } from "src/timestamp.entity"
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Record } from "src/record/record.entity";
import { Review } from "src/review/domain/review.entity";
import { Tag } from "src/record/tag.entity";

@Entity()
export class User extends TimestampEntity {
    @PrimaryGeneratedColumn()
    _id: number;

    @Column()
    _email: string;

    @Column()
    private password: string;

    @Column()
    _nickname: string;

    @OneToMany(() => Record, (record) => record.writer)
    records: Record[];

    @OneToMany(() => Review, (review) => review.writer)
    reviews: Review[];

    @OneToMany(() => Tag, (tag) => tag.user)
    tags: Tag[];

    public getId(): number {
        return this._id;
    }

    public getEmail(): string {
        return this._email;
    }

    public getPassword(): string {
        return this.password;
    }

    public getNickname(): string {
        return this._nickname;
    }

    public getRecords(): Record[] {
        return this.records;
    }

    public getReviews(): Review[] {
        return this.reviews;
    }

    public getTags(): Tag[] {
        return this.tags;
    }

    public updatePassword(newPassword: string): void {
        this.password = newPassword;
    }

    public updateNickname(newNickname: string): void {
        this._nickname = newNickname;
    }
}