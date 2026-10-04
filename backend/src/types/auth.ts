import type { AccessTokenPayload } from "../utils/jwt";

export interface AuthenticatedRequestUser extends AccessTokenPayload {}

export interface AuthenticatedRequest {
  user?: AuthenticatedRequestUser;
}
