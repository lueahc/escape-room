import { TimestampEntity } from "src/timestamp.entity"
import { User } from "src/user/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Review } from "../review/review.entity";
import { Theme } from "src/theme/theme.entity";
import { Tag } from "./tag.entity";

@Entity()
export class Record extends TimestampEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.records)
    public writer: User;

    @ManyToOne(() => Theme, (theme) => theme.records)
    public theme: Theme;

    @Column()
    isSuccess: boolean;

    @Column()
    playDate: Date;

    @Column()
    headCount: number;

    @Column({ nullable: true })
    hintCount: number;

    @Column({ nullable: true })
    playTime: number;

    @Column({ nullable: true })
    image: string;

    @OneToMany(() => Review, (review) => review.record)
    public reviews: Review[];

    @OneToMany(() => Tag, (tag) => tag.record)
    public tags: Tag[];
}