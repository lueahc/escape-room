import { Tag } from "../domain/tag.entity";
import { RecordPartial } from "../record.types";
import { Record } from "./record.entity";

export interface RecordRepository {
    create(record: Partial<Record>): Record;
    save(record: Record): Promise<Record>;
    softDelete(id: number): Promise<void>;
    createTag(tag: Partial<Tag>): Tag;
    saveTag(tag: Tag): Promise<Tag>;
    softDeleteTag(id: number): Promise<void>;
    findOneById(id: number);
    getRecordInfo(id: number);
    getOneTag(userId: number, recordId: number);
    getTaggedUserIds(recordId: number): Promise<Tag[]>;
    getTaggedNicknames(userId: number, recordId: number): Promise<Tag[]>;
    getLogs(userId: number);
    getRecordAndReviews(whereConditions: RecordPartial): Promise<Record[]>;
}