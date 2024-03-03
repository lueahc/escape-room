import { TimestampEntity } from "src/timestamp.entity"
import { User } from "src/user/user.entity";
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
}