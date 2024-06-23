import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Tag } from "./domain/tag.entity";
import { UserService } from "src/user/user.service";
import { RECORD_REPOSITORY } from "src/inject.constant";
import { RecordRepository } from "./domain/record.repository";
import { Record } from "./domain/record.entity";
import { User } from "src/user/domain/user.entity";
import { ReviewService } from "src/review/review.service";

@Injectable()
export class TagPartyService {
    constructor(
        @Inject(RECORD_REPOSITORY)
        private readonly recordRepository: RecordRepository,
        private readonly userService: UserService,
        private readonly reviewService: ReviewService
    ) { }

    private setPartyUnique(party: any[], userId: number) {
        return [...new Set(party.filter((element) => element !== userId))]; // 본인 및 중복값 제외
    }

    private isArrayNotEmpty(arr) {
        return !(arr.length === 1 && arr[0] === '');
    }

    private isHeadCountLessThanPartyLength(headCount: number, party): boolean {
        return headCount <= party.length;
    }

    private validatePartyNumber(party, headCount: number): void {
        if (this.isHeadCountLessThanPartyLength(headCount, party)) {
            throw new BadRequestException(
                '일행으로 추가할 사용자 수가 인원 수보다 많습니다.',
                'PARTY_LENGTH_OVER_HEADCOUNT'
            )
        }
    }

    private async validateMember(memberId: number): Promise<User> {
        const member = await this.userService.findOneById(memberId);
        if (!member) {
            throw new NotFoundException(
                `일행 memberId:${memberId}는 존재하지 않습니다.`,
                'NON_EXISTING_PARTY'
            );
        }
        return member;
    }

    private async createAndSaveTag(member: User, record: Record) {
        const tag = await Tag.create({ user: member, record, isWriter: false });
        await this.recordRepository.saveTag(tag);
    }

    private getFinalHeadCount(headCount: number, record: Record) {
        return headCount ?? record.getHeadCount();
    }

    private async getOriginalTaggedMembers(userId: number, recordId: number) {
        const tags = await this.recordRepository.getTaggedUsers(userId, recordId);
        return tags.map(tag => tag.getUser().getId());
    }

    private async getUntaggedMembers(newParty, originalParty) {
        return await originalParty.filter(element => !newParty.includes(element));
    }

    private async hasWrittenReviews(memberId: number, recordId: number): Promise<void> {
        const hasWrittenReview = await this.reviewService.hasWrittenReview(memberId, recordId);
        if (hasWrittenReview) {
            throw new NotFoundException(
                `일행 memberId:${memberId}는 이미 작성한 리뷰가 있습니다.`,
                'EXISTING_REVIEW'
            );
        }
    }

    private async deleteTagWhenNoReviews(memberId: number, recordId: number): Promise<void> {
        const deleteTag = await this.recordRepository.getOneTag(memberId, recordId);
        if (!deleteTag) {
            throw new NotFoundException(
                '삭제할 일행이 존재하지 않습니다.',
                'NON_EXISTING_USER'
            );
        }
        await this.recordRepository.softDeleteTag(deleteTag.getId());
    }

    async createTags(party, userId: number, headCount: number, record: Record) {
        if (party) {
            const uniqueParty = this.setPartyUnique(party, userId);
            if (this.isArrayNotEmpty(uniqueParty)) {
                this.validatePartyNumber(uniqueParty, headCount);
                for (const memberId of uniqueParty) {
                    const member = await this.validateMember(memberId);
                    await this.createAndSaveTag(member, record);
                }
            }
        }
    }

    async updateTags(party, userId: number, headCount: number, record: Record) {
        if (party) {
            const uniqueParty = this.setPartyUnique(party, userId);
            if (this.isArrayNotEmpty(uniqueParty)) {
                const finalHeadCount = this.getFinalHeadCount(headCount, record);
                this.validatePartyNumber(uniqueParty, finalHeadCount);

                // 일행 추가
                const originalParty = await this.getOriginalTaggedMembers(userId, record.getId());
                for (const memberId of uniqueParty) {
                    const member = await this.validateMember(memberId);
                    if (!originalParty.includes(memberId)) {
                        await this.createAndSaveTag(member, record);
                    }
                }

                // 일행 삭제
                const filteredParty = await this.getUntaggedMembers(uniqueParty, originalParty);
                for (const memberId of filteredParty) {
                    await this.hasWrittenReviews(memberId, record.getId());
                    await this.deleteTagWhenNoReviews(memberId, record.getId());
                }
            }
        }
    }
}
