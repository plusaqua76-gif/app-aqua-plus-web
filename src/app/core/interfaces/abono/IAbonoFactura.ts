import { IDeudaCliente } from '../deuda/IDeudaCliente';

export interface IAbonoFactura {
  id: number;
  deudaCliente: IDeudaCliente;
  valor: string;
  activo: boolean;
  usuarioCreacion: string;
  fechaCreacion: Date;
  usuarioActualizacion: string;
  fechaModificacion: Date;
}
