import { TimestampEntity } from "src/timestamp.entity"
import { User } from "src/user/user.entity";
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Record } from "./record.entity";

@Entity()
export class Tag extends TimestampEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Record, (record) => record.tags)
    public record: Record;

    @ManyToOne(() => User, (user) => user.tags)
    public user: User;
}