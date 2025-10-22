import { ICity } from "./Icity";
import { ICorregimiento } from "./icorregimiento";
import { IDepartament } from "./Idepartament";

export interface IAddress {
  id: number;
  departamentoId: IDepartament;
  ciudadId: ICity;
  corregimientoId: ICorregimiento;
  descripcion: string | null;
  activo: boolean;
  usuarioCreacion: string;
  fechaCreacion: string;
  usuarioModificacion: string | null;
  fechaModificacion: string | null;
}


export interface IAddressRequest {
  id?: number;
  departamento: {
    id: number;
  };
  ciudad: {
    id: number;
  };
  corregimiento: {
    id: number;
  };
  descripcion: string;
}
