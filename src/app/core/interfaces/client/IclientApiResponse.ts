export interface ClientApiResponse {
  id: number;
  direccion: DireccionCompleta;
  tipoDocumento: TipoDocumentoCompleto;
  numeroCedula: string;
  nombre: string;
  segundoNombre?: string;
  apellido: string;
  segundoApellido?: string;
  codigo: string | null;
  activo: boolean;
  correo: string;
  telefono: string;
}

export interface DireccionCompleta {
  id: number;
  departamento: CatalogoItem;
  ciudad: CatalogoItem;
  corregimiento: CatalogoItem;
  descripcion: string;
}

export interface CatalogoItem {
  id: number;
  nombre: string;
}

export interface TipoDocumentoCompleto {
  id: number;
  nombre: string;
  codigo: string;
}

// Respuesta paginada específica para clientes
export interface ClientsPaginatedApiResponse {
  success: boolean;
  message: string;
  code: number;
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  response: ClientApiResponse[];
}

// Respuesta simple para listado completo
export interface ClientsApiResponse {
  success: boolean;
  message: string;
  code: number;
  response: ClientApiResponse[];
}
