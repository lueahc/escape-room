import { Tag } from "../domain/tag.entity";
import { RecordPartial } from "../record.types";
import { Record } from "./record.entity";

export interface RecordRepository {
    getRecordById(id: number);
    getRecordInfo(id: number);
    getOneTag(userId: number, recordId: number);
    getTaggedUsersByRecordId(recordId: number): Promise<Tag[]>;
    getTaggedNicknamesByRecordId(userId: number, recordId: number): Promise<Tag[]>;
    getLogs(userId: number);
    create(record: Partial<Record>): Record;
    save(record: Record): Promise<Record>;
    softDelete(id: number): Promise<void>;
    getRecordAndReviews(whereConditions: RecordPartial): Promise<Record[]>;
}