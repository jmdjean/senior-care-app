import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { CreateErrorLogPayload, ErrorLogService } from '../services/error-log.service';
import { apiUrls } from '../urls';

const shouldSkipLog = (url: string): boolean => url.includes(apiUrls.errorLogs);

const shouldLogBody = (method: string, body: unknown): boolean => {
  if (!body) return false;
  const normalizedMethod = method.toUpperCase();
  return normalizedMethod !== 'GET' && normalizedMethod !== 'HEAD';
};

const serializeBody = (body: unknown): unknown => {
  if (body === undefined) return null;
  if (typeof body === 'string') return body;
  try {
    return JSON.parse(JSON.stringify(body));
  } catch {
    return 'Corpo da requisição não pôde ser serializado.';
  }
};

const resolveErrorMessage = (error: HttpErrorResponse): string => {
  if (typeof error.error === 'string' && error.error.trim().length > 0) {
    return error.error;
  }
  if (typeof error.error?.message === 'string') {
    return error.error.message;
  }
  return error.message || 'Erro desconhecido ao processar a requisição.';
};

export const errorLogInterceptor: HttpInterceptorFn = (req, next) => {
  const errorLogService = inject(ErrorLogService);

  return next(req).pipe(
    catchError((rawError: unknown) => {
      if (rawError instanceof HttpErrorResponse && rawError.status !== 200 && !shouldSkipLog(req.url)) {
        const payload: CreateErrorLogPayload = {
          dataHoraTransacao: new Date().toISOString(),
          urlRequisicao: req.url,
          corpoRequisicao: shouldLogBody(req.method, req.body) ? serializeBody(req.body) : null,
          erro: resolveErrorMessage(rawError),
          statusRequisicao: rawError.status,
          metodo: req.method
        };

        errorLogService.create(payload).subscribe({
          error: () => {
            /* Evita quebrar o fluxo principal caso o envio do log falhe. */
          }
        });
      }

      if (rawError instanceof HttpErrorResponse) {
        return throwError(() => rawError);
      }

      return throwError(() => rawError ?? new Error('Erro desconhecido'));
    })
  );
};
