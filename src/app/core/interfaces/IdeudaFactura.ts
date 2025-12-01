import { IEnterpriseClientCounter } from "./IenterpriseClientCounter";
import { IFactura } from "./Ifactura";

export interface IDeudaCliente {
    id: number;
    empresaClienteContador: IEnterpriseClientCounter;
    tipoDeuda: ITipoDeuda;
    plazoPago: number;
    factura: IFactura;
    fechaDeuda: Date;
    valor: string;
    descripcion: string;
    activo: boolean;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioActualizacion: string;
    fechaModificacion: Date;
}

export interface IDeudaClienteResponse {
    id: number;
    fechaDeuda: string;
    valor: number;
    descripcion: string;
    activo: boolean;
    facturaId: number;
    facturaCodigo: string;
    eccId: number;
    empresaId: number;
    clienteNombre: string;
    tipoDeuda: {
        id: number;
        nombre: string;
        descripcion: string;
        codigo: string;
    };
    plazoPago: {
        id: number;
        nombre: string;
        descripcion: string;
    } | null;
}
export interface IPlazoPago {
    id: number;
    nombre: string;
    descripcion: string;
    activo: boolean;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string | null;
    fechaModificacion: Date | null;
}
export interface ITipoDeuda {
    id: number;
    nombre: string;
    descripcion: string;
    activo: boolean;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion: string | null;
    fechaModificacion: Date | null;
}
export interface IAbonoFactura{
    id: number;
    deudaCliente: IDeudaCliente;
    valor: string;
    activo: boolean;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioActualizacion: string;
    fechaModificacion: Date;
}

/**
 * Interfaz para la respuesta paginada de abono factura del backend
 * Esta estructura corresponde exactamente a la API de abono/empresa/{id}
 */
export interface IAbonoFacturaResponse {
    cliente: string;
    codigoFactura: string;
    fechaAbono: string;
    valorAbono: number;
}
