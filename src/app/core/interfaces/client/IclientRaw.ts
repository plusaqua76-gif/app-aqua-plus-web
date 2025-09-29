// Interfaz para la respuesta real del servidor (datos aplanados)
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
  corregimientoNombre: string;
  correo: string;
  telefono: string;
}

export interface ClientsRawApiResponse {
  success: boolean;
  message: string;
  code: number;
  response: ClientRaw[];
}

// Respuesta paginada para clientes raw
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
