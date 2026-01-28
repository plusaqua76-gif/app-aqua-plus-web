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
  naturaleza: Naturaleza;
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




// {
//   "empresa": {
//     "id": 5
//   },
//   "tipoCuenta": {
//     "id": 2
//   },
//   "naturaleza": {
//     "id": 1
//   },
//   "categoriaCuenta": {
//     "id": 3
//   },
//   "codigo": "1105",
//   "nombre": "Caja General",
//   "valor": 5000000.50,
//   "corriente": true,
//   "activo": true,
//   "usuarioCreacion": "admin"
// }
export interface IAccountDetail extends IAccount {}

