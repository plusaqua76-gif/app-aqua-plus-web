export interface IRol {
  id: number;
  nombre: string;
}

export interface IMenu {
  id: number;
  link: string;
  icono: string;
  etiqueta: string;
}

export interface IRoleMenuResponse {
  id: number;
  rol: IRol;
  menu: IMenu;
}


export interface IRoleMenuListResponse extends Array<IRoleMenuResponse> {}
