import { IPerson } from "@interfaces/Iperson";
import { ITypeCounter } from "@interfaces/ItypeCounter";
import { IAddress } from "./Iaddress";

export interface ICounter {
    id: number;
    cliente: IPerson;
    tipoContador: ITypeCounter;
    nuid: string;
    descripcion: IAddress;
    serial: string;
    activo: string;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioActualizacion: string;
    fechaModificacion: Date;
}
