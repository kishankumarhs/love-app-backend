import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body } = request;

    // Skip audit for GET requests and non-authenticated requests
    if (method === 'GET' || !user) {
      return next.handle();
    }

    const action = this.getActionFromMethod(method);
    const entityType = this.getEntityTypeFromUrl(url);

    return next.handle().pipe(
      tap(async (response) => {
        try {
          // Extract entity ID from response or URL
          const entityId = response?.id || this.getEntityIdFromUrl(url);

          if (entityId && entityType) {
            await this.auditService.logAction(
              user.id,
              action,
              entityType,
              entityId,
              method === 'PUT' || method === 'PATCH' ? body : null,
              response,
            );
          }
        } catch (error) {
          // Log error but don't fail the request
          console.error('Audit logging failed:', error);
        }
      }),
    );
  }

  private getActionFromMethod(method: string): string {
    switch (method) {
      case 'POST':
        return 'CREATE';
      case 'PUT':
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return 'UNKNOWN';
    }
  }

  private getEntityTypeFromUrl(url: string): string {
    // Extract entity type from URL path
    const pathSegments = url.split('/').filter((segment) => segment);
    const apiIndex = pathSegments.findIndex((segment) => segment === 'api');

    if (apiIndex >= 0 && pathSegments.length > apiIndex + 2) {
      return pathSegments[apiIndex + 2]; // Skip 'api' and version
    }

    return 'unknown';
  }

  private getEntityIdFromUrl(url: string): string | null {
    // Extract UUID from URL path
    const uuidRegex =
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = url.match(uuidRegex);
    return match ? match[0] : null;
  }
}
