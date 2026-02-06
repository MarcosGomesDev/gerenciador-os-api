import {
  CircuitBreakerOpenException,
  TimeoutError,
} from '@infrastructure/circuit-breaker';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { TokenExpiredException } from './token-expired.exception';
import { REQUEST_ID_KEY } from '../interceptors';

type ErrorResponse = {
  statusCode: number;
  error: string;
  message: string[] | string;
};

@Catch(HttpException, CircuitBreakerOpenException, TimeoutError)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * Lista de campos sensíveis que devem ser sanitizados
   */
  private readonly sensitiveFields = [
    'password',
    'token',
    'apikey',
    'api_key',
    'secret',
    'authorization',
    'cookie',
    'accesstoken',
    'access_token',
    'refreshtoken',
    'refresh_token',
    'jwt',
    'jwt_secret',
    'session',
    'sessionid',
    'session_id',
    'csrf',
    'csrf_token',
    'privatekey',
    'private_key',
    'publickey',
    'public_key',
    'credential',
    'credentials',
  ];

  catch(
    exception: HttpException | CircuitBreakerOpenException | TimeoutError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Tratar exceções específicas do circuit breaker
    if (exception instanceof CircuitBreakerOpenException) {
      const retryAfter = Math.ceil(exception.retryAfter / 1000);
      response.setHeader('Retry-After', retryAfter.toString());
      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        timestamp: new Date().toISOString(),
        path: request.url,
        message:
          'Serviço temporariamente indisponível. Tente novamente mais tarde.',
        retryAfter,
      });
      const requestId = (request as any)[REQUEST_ID_KEY];
      this.logger.warn(
        `Circuit breaker OPEN for ${exception.key}. Retry after ${retryAfter}s`,
        { requestId },
      );
      return;
    }

    if (exception instanceof TimeoutError) {
      response.status(HttpStatus.REQUEST_TIMEOUT).json({
        statusCode: HttpStatus.REQUEST_TIMEOUT,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: 'A operação excedeu o tempo limite. Tente novamente.',
      });
      const requestId = (request as any)[REQUEST_ID_KEY];
      this.logger.warn(`Timeout error for circuit breaker ${exception.key}`, {
        requestId,
      });
      return;
    }

    // Tratar HttpException normalmente
    const status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse: ErrorResponse =
      exception.getResponse() as ErrorResponse;

    const message = Array.isArray(errorResponse.message)
      ? errorResponse.message.join(', ')
      : errorResponse.message || exception.message || 'Internal server error';

    // Sanitizar dados sensíveis do request para logging
    const sanitizedRequest = this.sanitizeRequest(request);

    // Obtém o Request ID se disponível
    const requestId = (request as any)[REQUEST_ID_KEY];

    // Log apenas em desenvolvimento ou com dados sanitizados
    if (process.env.NODE_ENV === 'dev') {
      this.logger.debug('HTTP Exception', {
        requestId,
        statusCode: status,
        path: request.url,
        method: request.method,
        message,
        request: sanitizedRequest,
      });
    } else {
      // Em produção, log apenas informações essenciais
      this.logger.warn('HTTP Exception', {
        requestId,
        statusCode: status,
        path: request.url,
        method: request.method,
        message,
      });
    }

    // Garantir que a mensagem de erro não contenha dados sensíveis
    const sanitizedMessage = this.sanitizeMessage(message);

    // Adiciona header para indicar que o token expirou e o frontend deve fazer refresh
    if (exception instanceof TokenExpiredException) {
      response.setHeader('X-Token-Expired', 'true');
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: sanitizedMessage,
    });
  }

  /**
   * Sanitiza o objeto Request removendo dados sensíveis
   */
  private sanitizeRequest(request: Request): Record<string, any> {
    return {
      method: request.method,
      url: request.url,
      headers: this.sanitizeObject(request.headers || {}),
      body: this.sanitizeObject(request.body || {}),
      query: this.sanitizeObject(request.query || {}),
      params: request.params || {},
      ip: request.ip,
      userAgent: request.get('user-agent'),
    };
  }

  /**
   * Sanitiza um objeto recursivamente, removendo ou mascarando campos sensíveis
   */
  private sanitizeObject(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    // Se for array, sanitizar cada item
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    const sanitized: any = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = this.sensitiveFields.some((field) =>
          lowerKey.includes(field.toLowerCase()),
        );

        if (isSensitive) {
          // Mascarar dados sensíveis
          const value = obj[key];
          if (typeof value === 'string' && value.length > 0) {
            sanitized[key] = '[REDACTED]';
          } else {
            sanitized[key] = '[REDACTED]';
          }
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          // Recursivamente sanitizar objetos aninhados
          sanitized[key] = this.sanitizeObject(obj[key]);
        } else {
          sanitized[key] = obj[key];
        }
      }
    }

    return sanitized;
  }

  /**
   * Sanitiza a mensagem de erro para garantir que não contenha dados sensíveis
   */
  private sanitizeMessage(message: string): string {
    if (!message || typeof message !== 'string') {
      return message;
    }

    // Verificar se a mensagem contém algum campo sensível
    const lowerMessage = message.toLowerCase();
    const containsSensitive = this.sensitiveFields.some((field) =>
      lowerMessage.includes(field.toLowerCase()),
    );

    if (containsSensitive) {
      // Se contiver dados sensíveis, retornar mensagem genérica
      return 'Ocorreu um erro ao processar a requisição';
    }

    return message;
  }
}
