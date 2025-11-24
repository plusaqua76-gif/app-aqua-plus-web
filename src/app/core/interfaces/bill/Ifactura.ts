import { ICounter } from "@interfaces/Icounter";
import { IEnterprise } from "@interfaces/Ienterprise";
import { IEnterpriseClientCounter } from "@interfaces/IenterpriseClientCounter";


export interface IFactura {
    id: number;
    empresaClienteContador: IEnterpriseClientCounter;
    tarifa: ITarifa;
    lectura: ILectura;
    tipoPago: ITipoPago;
    estado: IEstado;
    fechaEmision: string | null;
    fechaFin: string | null;
    consumo: number;
    precio: string;
    codigo: string;
    activo: boolean;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string | null;
    fechaModificacion: Date | null;
}

export interface ITarifa {
    id: number;
    empresa: IEnterprise;
    tipoTarifa: ITipoTarifa;
    valor: string;
    activo: boolean;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string | null;
    fechaModificacion: Date | null;
}

export interface ITipoTarifa {
    id: number;
    nombre: string;
    descripcion: string;
    activo: boolean;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string | null;
    fechaModificacion: Date | null;
}

export interface ILectura {
    id: number;
    contador: ICounter;
    lectura: string;
    fechaLectura: string;
    consumoAnormal: string;
    descripcion: string;
    activo: boolean;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string | null;
    fechaModificacion: Date | null;
}

export interface ITipoPago {
    id: number;
    nombre: string;
    descripcion: string;
    activo: boolean;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string | null;
    fechaModificacion: Date | null;
}

export interface IEstado {
    id: number;
    nombre: string;
    descripcion: string;
    activo: boolean;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string | null;
    fechaModificacion: Date | null;
}


export interface IfacturaResponse {
    id: number;
    empresaClienteContadorId: number;
    personaId: number;
    nombre: string;
    segundoNombre: string;
    apellido: string;
    segundoApellido: string;
    tarifaId: number;
    tarifaValor: string;
    lecturaId: number;
    consumoAnormal: string;
    tipoPagoId: number;
    tipoPagoNombre: string;
    estadoId: number;
    estadoNombre: string;
    fechaEmision: Date;
    fechaFin: Date;
    consumo: number;
    precio: string;
    codigo: string;
    activo: boolean;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string | null;
    fechaModificacion: Date | null
}
