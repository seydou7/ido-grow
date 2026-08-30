"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { useI18n } from "@/i18n/i18n-provider";
import { LanguageSelector } from "@/i18n/language-selector";
import type { Translate } from "@/i18n/runtime";
import { SupplierDashboard } from "@/organisations/supplier-dashboard";

import { getAuthenticationSession, login, logout } from "./api";
import type { AuthenticationSession } from "./contracts";

type LoginFormValues = Readonly<{
  email: string;
  password: string;
}>;

type ViewState = "checking" | "ready" | "submitting";

function safeErrorMessage(t: Translate): string {
  return t("auth.errorGeneric");
}

function BrandMark({ inverted = false }: Readonly<{ inverted?: boolean }>) {
  return (
    <span
      aria-hidden="true"
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${
        inverted ? "bg-[#e5b84b] text-[#2d2817]" : "bg-[#284f41] text-[#fffaf0]"
      }`}
    >
      <svg fill="none" height="24" viewBox="0 0 24 24" width="24">
        <path
          d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path
          d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4M5 21h14"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </span>
  );
}

function FieldIcon({ name }: Readonly<{ name: "email" | "password" }>) {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      {name === "email" ? (
        <>
          <rect height="16" rx="2" stroke="currentColor" strokeWidth="2" width="20" x="2" y="4" />
          <path d="m22 7-10 6L2 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </>
      ) : (
        <>
          <rect height="11" rx="2" stroke="currentColor" strokeWidth="2" width="18" x="3" y="11" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </>
      )}
    </svg>
  );
}

export function AuthenticationPanel() {
  const { t } = useI18n();
  const [session, setSession] = useState<AuthenticationSession>({
    status: "unauthenticated",
  });
  const [viewState, setViewState] = useState<ViewState>("checking");
  const [requestError, setRequestError] = useState<string | null>(null);
  const {
    register,
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
      .catch(() => {
        if (active) {
          setSession({ status: "unauthenticated" });
          setRequestError(safeErrorMessage(t));
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
  }, [t]);

  const submitLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setViewState("submitting");
    setRequestError(null);

    const formData = new FormData(event.currentTarget);
    const email = ((formData.get("email") as string) || "").trim();
    const password = (formData.get("password") as string) || "";

    if (!email) {
      setRequestError(t("auth.emailRequired"));
      setViewState("ready");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setRequestError(t("auth.emailInvalid"));
      setViewState("ready");
      return;
    }

    if (!password) {
      setRequestError(t("auth.passwordRequired"));
      setViewState("ready");
      return;
    }

    try {
      const nextSession = await login({
        email,
        password,
      });

      setSession(nextSession);
      reset({ email: "", password: "" });
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : safeErrorMessage(t),
      );
    } finally {
      setViewState("ready");
    }
  };

  const submitLogout = async () => {
    setViewState("submitting");
    setRequestError(null);

    try {
      await logout();
      setSession({ status: "unauthenticated" });
      reset({ email: "", password: "" });
    } catch {
      setRequestError(safeErrorMessage(t));
    } finally {
      setViewState("ready");
    }
  };

  const busy = viewState !== "ready";

  // When authenticated, render the dedicated full-width application shell
  if (viewState === "ready" && session.status === "authenticated") {
    return (
      <SupplierDashboard
        userEmail={session.user.email}
        onLogout={() => void submitLogout()}
        isLoggingOut={busy}
      />
    );
  }

  // Unauthenticated / checking session: render the approved split-screen login shell
  return (
    <main className="grid min-h-screen bg-[#fbf8ef] lg:grid-cols-[1.08fr_1fr]">
      {/* Visual Marketing Panel */}
      <section className="relative hidden min-h-screen overflow-hidden lg:block" aria-label="I Do Grow">
        <Image
          alt="Natural fibres"
          className="object-cover"
          fill
          priority
          sizes="54vw"
          src="/brand/portal-fibres.jpg"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(31,70,57,0.97)_0%,rgba(31,70,57,0.88)_55%,rgba(31,70,57,0.58)_100%)]" />

        <div className="relative flex min-h-screen flex-col px-12 py-10 xl:px-16 xl:py-12">
          <div className="flex items-center gap-3 text-[#fffaf0]">
            <BrandMark inverted />
            <div>
              <p className="text-base font-semibold tracking-tight">I Do Grow</p>
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-[#fffaf0]/70">
                Natural Fibres Trading
              </p>
            </div>
          </div>

          <div className="mt-auto max-w-lg pb-3 text-[#fffaf0]">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#e5b84b]">
              {t("presentation.eyebrow")}
            </p>
            <p className="mt-4 max-w-md text-4xl font-semibold leading-[1.12] tracking-tight xl:text-[2.75rem]">
              Natural-fibre trade, brought into focus.
            </p>
            <p className="mt-5 max-w-md text-sm leading-6 text-[#fffaf0]/78">
              {t("presentation.intro")}
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Login Form Panel (ONE single LanguageSelector) */}
      <section
        aria-label={t("auth.sectionLabel")}
        className="relative flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-12"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-[#e5b84b] lg:hidden" />
        <div className="absolute right-6 top-5 sm:right-10 lg:right-12">
          <LanguageSelector />
        </div>
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <BrandMark />
            <div>
              <p className="text-base font-semibold tracking-tight text-[#203e35]">I Do Grow</p>
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-[#53625d]">
                Natural Fibres Trading
              </p>
            </div>
          </div>

          {viewState === "checking" ? (
            <div className="flex min-h-80 flex-col items-center justify-center text-center" role="status">
              <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#ddd6c6] border-t-[#284f41]" />
              <p className="mt-4 text-sm font-medium text-[#5d6e68]">{t("auth.checkingSession")}</p>
            </div>
          ) : (
            <form className="min-h-80" noValidate onSubmit={submitLogin}>
              <h1 className="text-3xl font-semibold tracking-tight text-[#203e35]" id="authentication-heading">
                {t("auth.loginHeading")}
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#66736f]">
                {t("auth.loginDescription")}
              </p>

              <div className="mt-8">
                <label className="text-sm font-medium text-[#304f45]" htmlFor="email">
                  {t("auth.email")}
                </label>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b8984]">
                    <FieldIcon name="email" />
                  </span>
                  <input
                    autoComplete="username"
                    className="h-11 w-full rounded-lg border border-[#d4cdbc] bg-white pl-10 pr-3 text-base text-[#203e35] outline-none transition placeholder:text-[#65736e] focus:border-[#356a57] focus:ring-3 focus:ring-[#356a57]/12 disabled:bg-[#f1eee6]"
                    id="email"
                    type="email"
                    aria-describedby={errors.email ? "email-error" : undefined}
                    aria-invalid={errors.email ? "true" : "false"}
                    disabled={busy}
                    placeholder={t("auth.emailPlaceholder")}
                    {...register("email", {
                      required: t("auth.emailRequired"),
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: t("auth.emailInvalid"),
                      },
                    })}
                  />
                </div>
                {errors.email ? (
                  <p className="mt-2 text-sm text-[#a43f35]" id="email-error">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="mt-5">
                <label className="text-sm font-medium text-[#304f45]" htmlFor="password">
                  {t("auth.password")}
                </label>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b8984]">
                    <FieldIcon name="password" />
                  </span>
                  <input
                    autoComplete="current-password"
                    className="h-11 w-full rounded-lg border border-[#d4cdbc] bg-white pl-10 pr-3 text-base text-[#203e35] outline-none transition placeholder:text-[#65736e] focus:border-[#356a57] focus:ring-3 focus:ring-[#356a57]/12 disabled:bg-[#f1eee6]"
                    id="password"
                    type="password"
                    aria-describedby={errors.password ? "password-error" : undefined}
                    aria-invalid={errors.password ? "true" : "false"}
                    disabled={busy}
                    placeholder="••••••••"
                    {...register("password", {
                      required: t("auth.passwordRequired"),
                    })}
                  />
                </div>
                {errors.password ? (
                  <p className="mt-2 text-sm text-[#a43f35]" id="password-error">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              <button
                className="mt-7 h-11 w-full rounded-lg bg-[#284f41] px-4 text-sm font-semibold text-[#fffaf0] shadow-[0_1px_2px_rgba(31,70,57,0.15)] transition hover:bg-[#1f4035] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#356a57] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={busy}
                type="submit"
              >
                {busy ? t("auth.signInPending") : t("auth.signIn")}
              </button>
            </form>
          )}

          {requestError ? (
            <div
              className="mt-5 rounded-lg border border-[#e7c4bd] bg-[#fff5f2] px-4 py-3 text-sm leading-5 text-[#8c352d]"
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
