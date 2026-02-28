export interface ClientRaw {
  id: number;
  numeroCedula: string;
  nombre: string;
  segundoNombre?: string;
  apellido: string;
  segundoApellido?: string;
  codigo?: string | null;
  activo: boolean;
  direccionId: number;
  direccionDescripcion: string;
  departamentoNombre: string;
  ciudadNombre: string;
  nombreCompleto: string;
  corregimientoNombre: string;
  correo: string;
  telefono: string;
  empresaClienteContadorId: number;
}

export interface ClientsRawApiResponse {
  success: boolean;
  message: string;
  code: number;
  response: ClientRaw[];
}

export interface ClientsRawPaginatedApiResponse {
  success: boolean;
  message: string;
  code: number;
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  response: ClientRaw[];
}
