import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { BusinessException } from '../exceptions/business.exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    if (exception instanceof BusinessException) {
      // 处理业务异常
      const error = exception.getResponse() as any;
      response.status(200).json(error);
    } else {
      // 处理其他 HTTP 异常
      const status = exception.getStatus();
      const error = exception.getResponse();
      
      response.status(200).json({
        code: status,
        message: typeof error === 'string' ? error : (error as any).message || '请求失败',
        data: null
      });
    }
  }
}