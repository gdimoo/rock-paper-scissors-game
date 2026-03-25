import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Use this on endpoints that work for both authenticated users and guests.
 * If a valid JWT is present → req.user is populated.
 * If no token or invalid token → req.user stays undefined (no error thrown).
 */
@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  handleRequest<T>(_err: unknown, user: T): T {
    return user; // never throw — just return user or undefined
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
