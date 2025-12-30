export interface DianInvoice {
  idEmpresa: number;
  idCliente: number;
  productos: Array<{
    codigoEstandar: {
      idIdentificacion: string;
      id: string;
    };
    precio: number;
    descuento: number;
    cargo: number;
    cantidad: number;
    codigoUnidadMedida: string;
    iva: number;
    nombre: string;
    nota: string;
  }>;
  descuentos: Array<{
    indCargo: boolean;
    codigoRazon: string;
    razon: string;
  }>;
  medioPago: {
    forma: string;
    medio: string;
  };
  totalAnticipado: number;
  usuario: string;
}

export interface UnitCodes {
  code: string;
  value: string;
}

export interface ProductDian {
  id?: number;
  iva: number;
  codigoUnidad: string;
  nombre: string;
  descripcion: string;
  codigoEstandar?: string;
  activo?: boolean;
  usuarioCreacion?: string;
}
