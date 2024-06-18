import { TimestampEntity } from "src/timestamp.entity"
import { User } from "src/user/domain/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Record } from "./record.entity";

@Entity()
export class Tag extends TimestampEntity {
    @PrimaryGeneratedColumn()
    private id: number;

    @ManyToOne(() => User, (user) => user._tags)
    @JoinColumn({ name: 'user_id' })
    _user: User;

    @ManyToOne(() => Record, (record) => record._tags)
    @JoinColumn({ name: 'record_id' })
    _record: Record;

    @Column({ default: true })
    _visibility: boolean;

    @Column()
    private isWriter: boolean;

    static async create(params: { user: User, record: Record, isWriter: boolean }): Promise<Tag> {
        const { user, record, isWriter } = params;
        const tag = new Tag();
        tag._user = user;
        tag._record = record;
        tag.isWriter = isWriter;
        return tag;
    }

    public getId(): number {
        return this.id;
    }

    public getVisibility(): boolean {
        return this._visibility;
    }

    public getIsWriter(): boolean {
        return this.isWriter;
    }

    public getUser(): User {
        return this._user;
    }

    public getRecord(): Record {
        return this._record;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public changeVisibility(): void {
        if (this._visibility) this._visibility = false;
        else this._visibility = true;
    }
}