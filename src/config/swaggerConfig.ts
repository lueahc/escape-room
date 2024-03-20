import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

const createSwagger = (app: INestApplication) => {
    const config = new DocumentBuilder()
        .setTitle('ESCAPE-ROOM')
        .setDescription('API description')
        .setVersion('1.0')
        .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            in: 'header',
        },
            'token'
        )
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
};

export default createSwagger;