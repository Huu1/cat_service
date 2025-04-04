import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as express from 'express'; // Add this import

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  
  // 添加信任代理设置，解决 X-Forwarded-For 问题
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true);
  
  const configService = app.get(ConfigService);
  // 👇 输出验证 (部署后查看)
  console.log('当前配置：', {
    env: configService.get('NODE_ENV'),
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
  });

  // 限制请求速率
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 1000, // 限制每个IP 15分钟内最多100个请求
    }),
  );

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
