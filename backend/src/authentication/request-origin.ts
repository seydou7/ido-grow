import { AuthenticationProblem } from "./authentication-problem";
import { isLocalRuntime, LOCAL_FRONTEND_ORIGIN } from "./runtime-config";

export function assertAllowedStateChangingOrigin(
  origin: string | undefined,
): void {
  if (!origin) {
    return;
  }

  if (!isLocalRuntime() || origin !== LOCAL_FRONTEND_ORIGIN) {
    throw new AuthenticationProblem(
      403,
      "REQUEST_ORIGIN_REJECTED",
      "Request rejected",
      "The request origin is not allowed.",
    );
  }
}
