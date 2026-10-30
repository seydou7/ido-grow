export type AuthenticationIdentity = Readonly<{
  userId: string;
  email: string;
  role?: string | null;
}>;

export type UnauthenticatedEvidence = Readonly<{
  status: "unauthenticated";
}>;

export type AuthenticatedEvidence = Readonly<{
  status: "authenticated";
  identity: AuthenticationIdentity;
}>;

/**
 * Authentication evidence only. Application authorization context is
 * resolved separately and remains authoritative in the backend.
 */
export type AuthenticationEvidence =
  | UnauthenticatedEvidence
  | AuthenticatedEvidence;
