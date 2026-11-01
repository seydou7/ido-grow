import { AuthenticationProblem } from "./authentication-problem";
import { isLocalRuntime, LOCAL_FRONTEND_ORIGIN } from "./runtime-config";

export function getAllowedOrigins(): Set<string> {
  if (isLocalRuntime()) {
    return new Set([LOCAL_FRONTEND_ORIGIN]);
  }
  const origins = new Set<string>();
  if (process.env.IDO_GROW_DEMO_ORIGIN) {
    origins.add(process.env.IDO_GROW_DEMO_ORIGIN);
  }
  if (process.env.FRONTEND_ORIGIN) {
    origins.add(process.env.FRONTEND_ORIGIN);
  }
  return origins;
}

export function assertAllowedStateChangingOrigin(
  origin: string | undefined,
): void {
  if (!origin) {
    return;
  }

  if (isLocalRuntime()) {
    if (origin !== LOCAL_FRONTEND_ORIGIN) {
      throw new AuthenticationProblem(
        403,
        "REQUEST_ORIGIN_REJECTED",
        "Request rejected",
        "The request origin is not allowed.",
      );
    }
    return;
  }

  const allowed = getAllowedOrigins();
  if (!allowed.has(origin)) {
    throw new AuthenticationProblem(
      403,
      "REQUEST_ORIGIN_REJECTED",
      "Request rejected",
      "The request origin is not allowed.",
    );
  }
}
