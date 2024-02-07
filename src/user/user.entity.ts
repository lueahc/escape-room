import { TimestampEntity } from "src/timestamp.entity"
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PlatformType } from "./platform-type.enum";
import { Record } from "src/review/record.entity";
import { Review } from "src/review/review.entity";

@Entity()
export class User extends TimestampEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: PlatformType;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    nickname: string;

    @OneToMany(() => Record, (record) => record.writer)
    public records: Record[];

    @OneToMany(() => Review, (review) => review.writer)
    public reviews: Review[];
}