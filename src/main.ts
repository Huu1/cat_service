import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ConfigService } from '@nestjs/config'; // 添加这个导入
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  const expressApp = app.getHttpAdapter().getInstance();
  
  const configService = app.get(ConfigService);
  // 根据环境设置 trust proxy
  const isProduction = configService.get('NODE_ENV') === 'production';
  
  // 修改为更安全的设置
  if (isProduction) {
    // 在生产环境中，只信任第一个代理
    expressApp.set('trust proxy', 1);
  } else {
    // 在开发环境中，不信任任何代理
    expressApp.set('trust proxy', false);
  }

  // 限制请求速率
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 1000, // 限制每个IP 15分钟内最多1000个请求
      skipSuccessfulRequests: false,
      standardHeaders: true,
      legacyHeaders: false,
      // 添加自定义 IP 提取逻辑
      keyGenerator: (request, response) => {
        // 使用客户端真实IP
        const realIp = request.headers['x-real-ip'] || 
                       request.headers['x-forwarded-for'] || 
                       request.socket.remoteAddress;
        return Array.isArray(realIp) ? realIp[0] : realIp;
      },
      // 添加验证函数，明确告诉 express-rate-limit 我们已经处理了 trust proxy 问题
      validate: {
        trustProxy: false, // 禁用内置的 trustProxy 检查，因为我们自己处理
        xForwardedForHeader: false // 禁用对 x-forwarded-for 头的自动处理
      }
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
