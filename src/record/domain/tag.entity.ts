import { TimestampEntity } from "src/timestamp.entity"
import { User } from "src/user/domain/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Record } from "./record.entity";

@Entity()
export class Tag extends TimestampEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.tags)
    public user: User;

    @ManyToOne(() => Record, (record) => record.tags)
    public record: Record;

    @Column({ default: true })
    visibility: boolean;

    @Column()
    isWriter: boolean;

    public getId(): number {
        return this.id;
    }

    public getVisibility(): boolean {
        return this.visibility;
    }

    public getIsWriter(): boolean {
        return this.isWriter;
    }

    public getUser(): User {
        return this.user;
    }

    public getRecord(): Record {
        return this.record;
    }

    public setVisibilityTrue() {
        this.visibility = true;
    }

    public setVisibilityFalse() {
        this.visibility = false;
    }
}