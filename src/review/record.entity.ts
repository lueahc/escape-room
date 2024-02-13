import { TimestampEntity } from "src/timestamp.entity"
import { User } from "src/user/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Review } from "./review.entity";
import { Theme } from "src/theme/theme.entity";

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

    @Column()
    hintCount: number;

    @Column()
    leftPlayTime: number;

    @Column()
    image: string;

    @OneToMany(() => Review, (review) => review.record)
    public reviews: Review[];
}