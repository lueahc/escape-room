import { TimestampEntity } from "src/timestamp.entity"
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { PlatformType } from "./platform-type.enum";

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
}