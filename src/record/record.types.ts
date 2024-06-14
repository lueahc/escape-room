export type RecordPartial = Partial<Record<string, any>> & {
    tags?: {
        visibility?: boolean;
        user?: {
            _id?: number;
        };
    };
};