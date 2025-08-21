import { ApiResponse } from "./Iresponse";

export interface AuthResponse {
  id: number;
  nombre: string;
  token: string;
  rolId: number;
  personaId: number;
}

export interface Auth {
  nombre: string;
  contrasena: string;
}

export interface AuthLoginResponse extends ApiResponse<AuthResponse> {}
