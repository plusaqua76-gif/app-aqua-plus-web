export interface ITipoCuenta {
  id: number;
  codigo: string;
  nombre: string;
  naturaleza: string;
  descripcion: string;
}

 interface IEmpresa {
  id: number;
}
 interface TipoCuenta {
  id: number;
}

 interface Naturaleza {
  id: number;
}
interface ICuentaCategoria {
  id: number;
}


export interface IAccount {
  id: number;
  codigo: string;
  nombre: string;
  valor: number;
  tipoCuenta: ITipoCuenta;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface IAccountFilters {
  codigo?: string;
  nombre?: string;
  valor?: number;
  tipoNombre?: string;
  tipoNaturaleza?: string;
  descripcion?: string;
}

export interface ICreateAccount {
  id?: number;
  empresa: IEmpresa;
  tipoCuenta: TipoCuenta;
  naturaleza?: Naturaleza;
  categoriaCuenta: ICuentaCategoria;
  codigo: string;
  nombre: string;
  valor: number;
  activo: boolean;
  usuarioCreacion: string;
  fechaCreacion?: string;
  usuarioModificacion?: string;
  fechaModificacion?: string;
}


export interface IAccountDetail extends IAccount {}

