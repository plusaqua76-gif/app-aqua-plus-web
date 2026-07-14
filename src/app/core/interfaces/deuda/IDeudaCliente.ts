import { IEnterpriseClientCounter } from '../IenterpriseClientCounter';
import { IFactura } from '../Ifactura';
import { IPlazoPago } from './IPlazoPago';
import { ITipoDeuda } from './ITipoDeuda';

export interface IDeudaCliente {
  id: number;
  empresaClienteContador: IEnterpriseClientCounter | { id: number };
  tipoDeuda: ITipoDeuda | { id: number; nombre?: string };
  plazoPago: number | IPlazoPago | string;
  factura?: IFactura | { id: number; codigo?: string };
  fechaDeuda: Date | string;
  valor: number;
  valorTotal?: number;
  totalAbonado?: number;
  saldoPendiente?: number;
  valorMes?: number;
  clienteNombre?: string;
  facturaCodigo?: string;
  descripcion: string;
  activo: boolean;
  usuarioCreacion: string;
  fechaCreacion?: Date | string;
  usuarioCambio?: string;
  fechaCambio?: Date | string;
}
