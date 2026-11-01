import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import type { Observable } from "rxjs";

type HeaderResponse = {
  setHeader(name: string, value: string): void;
};

@Injectable()
export class AuthenticationNoStoreInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    context
      .switchToHttp()
      .getResponse<HeaderResponse>()
      .setHeader("Cache-Control", "no-store");

    return next.handle();
  }
}
