import { TimestampEntity } from "src/timestamp.entity"
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User extends TimestampEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nickname: string;
}