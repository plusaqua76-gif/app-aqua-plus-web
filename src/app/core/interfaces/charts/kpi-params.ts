export interface IClienteKPIParams {
  empresaId: number;
  anio: number;
  mes: number;
  rangoPor: 'emision' | 'vencimiento';
  exclusivo: boolean;
}
