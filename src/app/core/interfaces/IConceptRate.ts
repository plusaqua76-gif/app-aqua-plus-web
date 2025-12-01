import { IrateTypes } from "./IrateTypes";
import { IRol } from "./Irol";
import { IEstado } from "./Ifactura";
import { IDepartament } from "./Idepartament";
import { ICity } from "./Icity";
import { ICorregimiento } from "./icorregimiento";

export interface IUserSimple {
  id: number;
  rol: IRol;
  estado: IEstado;
  nombre: string;
  contrasena: string;
}

export interface IAddressSimple {
  id: number;
  departamentoId: IDepartament;
  ciudadId: ICity;
  corregimientoId: ICorregimiento;
}

export interface IEnterpriseSimple {
  id: number;
  usuario: IUserSimple;
  direccion: IAddressSimple;
  nombre: string;
  nit: string;
  codigo: string;
}

export interface ITarifa {
  id: number;
  empresa?: IEnterpriseSimple;
  tipoTarifa: IrateTypes;
}

export interface IConceptType {
  id: number;
  descripcion: string;
  codigo: string;
}

export interface IConceptRate {
  id: number;
  tipoTarifa: IrateTypes;
  tipoConcepto: IConceptType;
  valor?: number;
  indCalcularMc: boolean;
  porEstrato?: boolean;
  estratos?: Istratum[];
}

export interface Istratum {
  id: number;
  estrato: number;
  valor: number;
  rango: string;
}



