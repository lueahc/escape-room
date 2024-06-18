export type RecordPartial = Partial<Record<string, any>> & {
    _tags?: {
        _visibility?: boolean;
        _user?: {
            _id?: number;
        };
    };
};