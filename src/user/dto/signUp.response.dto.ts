export class SignUpResponseDto {
    id: number;
    email: string;
    createdAt: Date;

    constructor(params: { id: number; email: string; createdAt: Date }) {
        this.id = params.id;
        this.email = params.email;
        this.createdAt = params.createdAt;
    }
}