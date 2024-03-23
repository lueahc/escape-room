import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import * as mime from 'mime-types'
import s3Storage from 'multer-s3'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3'
import * as multerS3 from 'multer-s3'

@Module({
    imports: [
        MulterModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                storage: createS3Storage(configService),
                // limits: {
                //     fileSize: 1024 * 1024 * 5, // 5 MB
                //     files: 1,
                // },
                fileFilter(req, file, callback) {
                    callback(null, true);
                },
            }),
        }),
    ],
    controllers: [],
    providers: [],
    exports: [MulterModule]
})
export class S3StorageModule { }

function createS3Storage(configService: ConfigService) {
    const s3ClientConfig: S3ClientConfig = {
        region: configService.get<string>('AWS_S3_REGION'),
        credentials: {
            accessKeyId: configService.get<string>('AWS_S3_ACCESS_KEY') as string,
            secretAccessKey: configService.get<string>('AWS_S3_SECRET_ACCESS_KEY') as string,
        },
    };

    const s3 = new S3Client(s3ClientConfig);

    return multerS3({
        s3,
        bucket: configService.get<string>('AWS_S3_BUCKET') as string,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key(req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, file.fieldname + '-' + uniqueSuffix);
        },
    });
}