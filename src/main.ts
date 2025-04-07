import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import * as express from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 添加一个中间件来处理静态文件请求，跳过认证
  app.use('/api/uploads', (req, res, next) => {
    if (req.path.startsWith('/uploads/')) {
      next();
    } else {
      next();
    }
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // global prefix 全局注册路径前缀
  app.setGlobalPrefix('api');

  // 配置静态文件服务，将路径前缀改为 /api/uploads/
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/api/uploads/',
  });

  // 确保 Express 的 trust proxy 设置为 false
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', false);

  // 使用 helmet 中间件
  app.use(helmet());

  // global prefix 全局注册路径前缀
  app.setGlobalPrefix('api');

  // 注册全局拦截器和过滤器
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('小程序服务 API')
    .setDescription('小程序后端服务 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;

  await app.listen(port, '0.0.0.0');
  // console.log(`应用已启动，监听地址: 0.0.0.0:${port}`);
}

bootstrap();
