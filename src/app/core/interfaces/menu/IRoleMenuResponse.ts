/**
 * Interfaz para el rol dentro de la respuesta de rol-menu
 */
export interface IRol {
  id: number;
  nombre: string;
}

/**
 * Interfaz para el menú dentro de la respuesta de rol-menu
 */
export interface IMenu {
  id: number;
  link: string;
  icono: string;
  etiqueta: string;
}

/**
 * Interfaz para cada elemento de la respuesta de rol-menu
 */
export interface IRoleMenuResponse {
  id: number;
  rol: IRol;
  menu: IMenu;
}

/**
 * Interfaz para el array completo de la respuesta
 */
export interface IRoleMenuListResponse extends Array<IRoleMenuResponse> {}
