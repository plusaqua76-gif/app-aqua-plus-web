/**
 * Interfaz genérica para respuestas paginadas del servidor
 * Esta interfaz define la estructura estándar que devuelve la API
 * para cualquier endpoint que maneje paginación
 *
 * @template T - El tipo de datos contenidos en la respuesta
 */
export interface IPaginatedResponse<T> {
  /** Indica si la operación fue exitosa */
  success: boolean;

  /** Mensaje descriptivo de la respuesta */
  message: string;

  /** Código de estado HTTP */
  code: number;

  /** Número total de registros en la base de datos */
  totalCount: number;

  /** Tamaño de página solicitado */
  pageSize: number;

  /** Página actual (basada en 0) */
  currentPage: number;

  /** Número total de páginas disponibles */
  totalPages: number;

  /** Array de datos de la página actual */
  response: T[];
}

/**
 * Interfaz para los parámetros de paginación que se envían a la API
 */
export interface IPaginationParams {
  /** Número de página (basado en 0) */
  page: number;

  /** Tamaño de página (número de elementos por página) */
  size: number;

  /** Término de búsqueda opcional */
  search?: string;

  /** Filtros adicionales por columna */
  filters?: Record<string, string>;
}

/**
 * Interfaz que define el estado interno de paginación del componente tabla
 */
export interface IPaginationState {
  /** Página actual (basada en 0 para uso interno) */
  pageIndex: number;

  /** Tamaño de página */
  pageSize: number;

  /** Total de elementos */
  totalCount: number;

  /** Total de páginas */
  totalPages: number;

  /** Estado de carga */
  loading: boolean;
}
