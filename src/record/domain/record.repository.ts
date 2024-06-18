import { Tag } from "../domain/tag.entity";
import { RecordPartial } from "../record.types";
import { Record } from "./record.entity";

export interface RecordRepository {
    create(record: Partial<Record>): Record;
    save(record: Record): Promise<Record>;
    softDelete(id: number): Promise<void>;
    saveTag(tag: Tag): Promise<Tag>;
    softDeleteTag(id: number): Promise<void>;
    findOneById(id: number);
    getOneTag(userId: number, recordId: number);
    getTaggedUsers(userId: number, recordId: number): Promise<Tag[]>;
    getRecordInfo(id: number);
    getRecordAndReviews(whereConditions: RecordPartial): Promise<Record[]>;
    getLogs(userId: number): Promise<Record[]>;
}