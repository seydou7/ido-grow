export type ExternalIdentityReference = Readonly<{
  issuer: string;
  subject: string;
}>;

export type UnauthenticatedSession = Readonly<{
  status: "unauthenticated";
}>;

export type AuthenticatedSession = Readonly<{
  status: "authenticated";
  identity: ExternalIdentityReference;
}>;

export type AuthenticationSession =
  | UnauthenticatedSession
  | AuthenticatedSession;

/**
 * Exposes authentication state only. Business and organisational
 * authorization remains exclusively under backend control.
 */
export interface AuthenticationAdapter {
  getSession(): Promise<AuthenticationSession>;
}
