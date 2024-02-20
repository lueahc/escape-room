import { TimestampEntity } from "src/timestamp.entity"
import { User } from "src/user/user.entity";
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Record } from "./record.entity";

@Entity()
export class Tag extends TimestampEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.tags, { eager: true })
    public user: User;

    @ManyToOne(() => Record, (record) => record.tags)
    public record: Record;
}