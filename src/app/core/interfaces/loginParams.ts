import { Auth } from "./IAuth";

export interface LoginParams {
  cred: Auth;
  shouldLogin: boolean;
}
