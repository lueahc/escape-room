import { Tag } from "../domain/tag.entity";
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
    findVisibleRecords(userId: number): Promise<Record[]>;
    findHiddenRecords(userId: number): Promise<Record[]>;
    findAllRecords(userId: number): Promise<Record[]>;
    getLogs(userId: number): Promise<Record[]>;
}