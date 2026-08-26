import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";

type ProblemDetails = Readonly<{
  type: "about:blank";
  title: string;
  status: number;
  code: string;
  detail: string;
}>;

export class AuthenticationProblem extends HttpException {
  constructor(status: number, code: string, title: string, detail: string) {
    super({ type: "about:blank", title, status, code, detail }, status);
  }
}

type ProblemResponse = {
  status(code: number): ProblemResponse;
  type(contentType: string): ProblemResponse;
  setHeader(name: string, value: string): void;
  json(body: ProblemDetails & { instance: string; requestId: string }): void;
};

type ProblemRequest = { originalUrl: string };

@Catch(AuthenticationProblem)
export class AuthenticationProblemFilter implements ExceptionFilter {
  catch(exception: AuthenticationProblem, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<ProblemResponse>();
    const request = context.getRequest<ProblemRequest>();
    const problem = exception.getResponse() as ProblemDetails;
    const requestId = randomUUID();

    response.setHeader("X-Request-Id", requestId);

    response
      .status(exception.getStatus())
      .type("application/problem+json")
      .json({ ...problem, instance: request.originalUrl, requestId });
  }
}
