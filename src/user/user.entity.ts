import { TimestampEntity } from "../timestamp.entity"
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PlatformType } from "./platform-type.enum";
import { Record } from "../record/record.entity";
import { Review } from "../review/review.entity";
import { Tag } from "../record/tag.entity";

@Entity()
export class User extends TimestampEntity {
    @PrimaryGeneratedColumn()
    id: number;

    // @Column()
    // type: PlatformType;

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

    @OneToMany(() => Tag, (tag) => tag.user)
    public tags: Tag[];
}