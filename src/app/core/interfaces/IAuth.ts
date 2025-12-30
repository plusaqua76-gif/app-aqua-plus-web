import { ApiResponse } from "./Iresponse";

export interface EmpresaAuth {
  id: number;
  direccion: {
    id: number;
    departamento: { id: number };
    ciudad: { id: number };
  };
  nombre: string;
  nit: string;
  codigo: string;
  activo: boolean;
  usuarioCreacion: string;
  fechaCreacion: string;
  usuarioModificacion?: string;
  fechaModificacion?: string;
  idEmpresaDian: string;
}

export interface AuthResponse {
  id: number;
  nombre: string;
  token: string;
  refreshToken?: string;
  rolId: number;
  rol: string;
  personaId?: number;
  empresaId: number;
  empresa: EmpresaAuth;
}

export interface Auth {
  nombre: string;
  contrasena: string;
}

export interface AuthLoginResponse extends ApiResponse<AuthResponse> {}
