import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

const createSwagger = (app: INestApplication) => {
    const config = new DocumentBuilder()
        .setTitle('ESCAPE-ROOM')
        .setDescription('API description')
        .setVersion('1.0')
        .addSecurity('AdminAuth', {
            type: 'http',
            scheme: 'bearer'
        })
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
};

export default createSwagger;