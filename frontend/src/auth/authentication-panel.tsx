"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { getAuthenticationSession, login, logout } from "./api";
import type { AuthenticationSession } from "./contracts";

type LoginFormValues = Readonly<{
  email: string;
  password: string;
}>;

type ViewState = "checking" | "ready" | "submitting";

const SAFE_FALLBACK_ERROR = "Something went wrong. Please try again.";

function safeErrorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : SAFE_FALLBACK_ERROR;
}

export function AuthenticationPanel() {
  const [session, setSession] = useState<AuthenticationSession>({
    status: "unauthenticated",
  });
  const [viewState, setViewState] = useState<ViewState>("checking");
  const [requestError, setRequestError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    let active = true;

    void getAuthenticationSession()
      .then((currentSession) => {
        if (active) {
          setSession(currentSession);
          setRequestError(null);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setRequestError(safeErrorMessage(error));
        }
      })
      .finally(() => {
        if (active) {
          setViewState("ready");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const submitLogin = handleSubmit(async (values) => {
    setViewState("submitting");
    setRequestError(null);

    try {
      const authenticatedSession = await login({
        email: values.email.trim(),
        password: values.password,
      });
      setSession(authenticatedSession);
      reset();
    } catch (error) {
      setRequestError(safeErrorMessage(error));
    } finally {
      setViewState("ready");
    }
  });

  async function submitLogout() {
    setViewState("submitting");
    setRequestError(null);

    try {
      await logout();
      setSession({ status: "unauthenticated" });
    } catch (error) {
      setRequestError(safeErrorMessage(error));
    } finally {
      setViewState("ready");
    }
  }

  const busy = viewState !== "ready";

  return (
    <main className="relative isolate grid min-h-screen place-items-center overflow-hidden px-5 py-10 sm:px-8">
      <div className="absolute inset-0 -z-20 bg-[#f7f1e3]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-2/5 bg-[linear-gradient(145deg,#123e34_0%,#1b5747_58%,#a88b45_140%)]" />
      <div className="absolute left-[8%] top-[10%] -z-10 h-36 w-36 rounded-full border border-white/10 sm:h-56 sm:w-56" />

      <section className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-[#d8cfbb] bg-white shadow-[0_24px_70px_rgba(30,62,52,0.18)]">
        <header className="border-b border-[#ebe4d7] px-7 pb-6 pt-7 sm:px-9 sm:pt-9">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#174a3d] text-lg font-semibold text-[#f5e8bd]">
              IG
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a7d37]">
                I Do Grow
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#173f35]">
                Platform foundation
              </h1>
            </div>
          </div>
        </header>

        <div className="px-7 py-7 sm:px-9 sm:py-9">
          {viewState === "checking" ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center" role="status">
              <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#d9d0bc] border-t-[#174a3d]" />
              <p className="mt-4 text-sm font-medium text-[#4f685f]">Checking your session…</p>
            </div>
          ) : session.status === "authenticated" ? (
            <div className="min-h-64">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#e8f2ed] px-3 py-1 text-xs font-semibold text-[#21604e]">
                <span className="h-2 w-2 rounded-full bg-[#2d8066]" />
                Authenticated
              </span>
              <h2 className="mt-5 text-2xl font-semibold text-[#173f35]">Welcome back</h2>
              <p className="mt-2 text-sm leading-6 text-[#61726c]">
                Your secure local application session is active.
              </p>
              <div className="mt-6 rounded-2xl border border-[#e6dfd0] bg-[#faf8f2] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a7860]">
                  Signed in as
                </p>
                <p className="mt-2 break-all text-sm font-medium text-[#173f35]">
                  {session.user.email}
                </p>
              </div>
              <button
                className="mt-7 w-full rounded-xl border border-[#b8ad97] px-4 py-3 text-sm font-semibold text-[#234c40] transition hover:border-[#174a3d] hover:bg-[#f4f0e7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#174a3d] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={busy}
                onClick={() => void submitLogout()}
                type="button"
              >
                {busy ? "Signing out…" : "Sign out"}
              </button>
            </div>
          ) : (
            <form className="min-h-64" noValidate onSubmit={submitLogin}>
              <h2 className="text-2xl font-semibold text-[#173f35]">Sign in</h2>
              <p className="mt-2 text-sm leading-6 text-[#61726c]">
                Use your local test account to continue.
              </p>

              <div className="mt-6">
                <label className="text-sm font-semibold text-[#294f44]" htmlFor="email">
                  Email address
                </label>
                <input
                  autoComplete="email"
                  className="mt-2 w-full rounded-xl border border-[#cfc5b2] bg-white px-4 py-3 text-base text-[#173f35] outline-none transition placeholder:text-[#9ca8a3] focus:border-[#276653] focus:ring-3 focus:ring-[#276653]/15 disabled:bg-[#f4f1ea]"
                  id="email"
                  type="email"
                  aria-describedby={errors.email ? "email-error" : undefined}
                  aria-invalid={errors.email ? "true" : "false"}
                  disabled={busy}
                  {...register("email", {
                    required: "Enter your email address.",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address.",
                    },
                  })}
                />
                {errors.email ? (
                  <p className="mt-2 text-sm text-[#a43f35]" id="email-error">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="mt-5">
                <label className="text-sm font-semibold text-[#294f44]" htmlFor="password">
                  Password
                </label>
                <input
                  autoComplete="current-password"
                  className="mt-2 w-full rounded-xl border border-[#cfc5b2] bg-white px-4 py-3 text-base text-[#173f35] outline-none transition focus:border-[#276653] focus:ring-3 focus:ring-[#276653]/15 disabled:bg-[#f4f1ea]"
                  id="password"
                  type="password"
                  aria-describedby={errors.password ? "password-error" : undefined}
                  aria-invalid={errors.password ? "true" : "false"}
                  disabled={busy}
                  {...register("password", {
                    required: "Enter your password.",
                  })}
                />
                {errors.password ? (
                  <p className="mt-2 text-sm text-[#a43f35]" id="password-error">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              <button
                className="mt-7 w-full rounded-xl bg-[#174a3d] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123b31] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#174a3d] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={busy}
                type="submit"
              >
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </form>
          )}

          {requestError ? (
            <div
              className="mt-5 rounded-xl border border-[#e7c4bd] bg-[#fff5f2] px-4 py-3 text-sm leading-5 text-[#8c352d]"
              role="alert"
            >
              {requestError}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
