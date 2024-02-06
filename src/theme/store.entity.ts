import { TimestampEntity } from "src/timestamp.entity"
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Store extends TimestampEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    phoneNo: string;

    @Column()
    location: string;

    @Column()
    address: string;
}