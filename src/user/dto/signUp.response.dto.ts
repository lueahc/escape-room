export class SignUpResponseDto {
    id: number;
    email: string;
    createdAt: Date;

    constructor(params: { _id: number; _email: string; createdAt: Date }) {
        this.id = params._id;
        this.email = params._email;
        this.createdAt = params.createdAt;
    }
}