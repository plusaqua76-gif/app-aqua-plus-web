import { ApiResponse } from "./Iresponse";

export interface AuthResponse {
  id: number;
  nombre: string;
  token: string;
  rolId: number;
  rol: string; // Nombre del rol (ADMIN, CLIENTE, ROLMETRICASCONTABLE, etc.)
  personaId: number;
  empresaId: number; // ID de la empresa del usuario
}

export interface Auth {
  nombre: string;
  contrasena: string;
}

export interface AuthLoginResponse extends ApiResponse<AuthResponse> {}
