import { IRol } from "../Irol";
import { IMenu } from "./IMenu";
import { ApiResponse } from "../Iresponse";

export interface IRoleMenu {
  id: number;
  rol: IRol;
  menu: IMenu;
}

export interface IRoleMenuResponse extends ApiResponse<IRoleMenu[]> {}


export interface ICreateRole {
  nombre: string;
  usuarioCreacion?: string;
  activo?: boolean;
}
