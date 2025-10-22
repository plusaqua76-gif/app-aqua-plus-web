export interface IProductoVenta {
  idProducto: number;
  cantidad: number;
}

export interface ICreateVenta {
  idEmpresa: number;
  nombreCliente: string;
  identificacion: string;
  usuarioCreacion: string;
  productos: IProductoVenta[];
}

export interface IVentaForm {
  nombreCliente: string;
  identificacion: string;
}

export interface IProductoForm {
  idProducto: number;
  cantidad: number;
}
