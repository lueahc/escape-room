export interface EnvironmentVariable {
    DB_TYPE: string;
    DB_HOST: string;
    DB_PORT: number;
    DB_DATABASE: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_SYNCHRONIZE: boolean;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    AWS_S3_REGION: string;
    AWS_S3_ACCESS_KEY: string;
    AWS_S3_SECRET_ACCESS_KEY: string;
    AWS_S3_BUCKET: string;
}