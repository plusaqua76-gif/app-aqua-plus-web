import { IEnterprise } from "./Ienterprise";
import { IPerson } from "./Iperson";
import { IRol } from "./Irol";
import { IEstado } from "./Ifactura";


export interface Iuser {
    id: number;
    rol: IRol;
    persona: IPerson;
    estado: IEstado;
    nombre: string;
    contrasena: string;
    imagen?: string | null;
    usuarioCreacion?: string;
    fechaCreacion?: string;
    usuarioModificacion?: string | null;
    fechaModificacion?: string | null;
    activo?: boolean;
    token?: string;
}

export interface IAuthResponse {
  id: string;
  token: string;
  usuario: Iuser;
  rol: string;
}

export interface IUpdatePassword {
  nuevaContrasena: string;
  usuarioModificacion: string;
}

export interface ITipoDocumento {
  id: number;
  nombre: string;
  descripcion: string;
  usuarioCreacion: string;
  fechaCreacion: string;
  usuarioModificacion: string | null;
  fechaModificacion: string | null;
  activo: boolean;
}
