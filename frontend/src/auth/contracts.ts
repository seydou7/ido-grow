export type AuthenticatedUser = Readonly<{
  id: string;
  email: string;
  role?: string | null;
}>;

export type UnauthenticatedSession = Readonly<{
  status: "unauthenticated";
}>;

export type AuthenticatedSession = Readonly<{
  status: "authenticated";
  user: AuthenticatedUser;
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
