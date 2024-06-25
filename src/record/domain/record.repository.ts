import { Tag } from "../domain/tag.entity";
import { RecordPartial } from "../record.types";
import { Record } from "./record.entity";

export interface RecordRepository {
    create(record: Partial<Record>): Record;
    save(record: Record): Promise<Record>;
    softDelete(id: number): Promise<void>;
    saveTag(tag: Tag): Promise<Tag>;
    softDeleteTag(id: number): Promise<void>;
    findOneById(id: number): Promise<Record | null>;
    getOneTag(userId: number, recordId: number): Promise<Tag | null>;
    getTaggedUsers(userId: number, recordId: number): Promise<Tag[]>;
    getRecordInfo(id: number): Promise<Record | null>;
    getRecordAndReviews(whereConditions: RecordPartial): Promise<Record[]>;
    getLogs(userId: number): Promise<Record[]>;
}