export interface MovimientoContable {
  id: number;
  empresa: {
    id: number;
  };
  tipoCuenta: {
    id: number;
  };
  categoriaCuenta: {
    id: number;
    nombre: string;
  };
  codigo: string;
  nombre: string;
  valor: number;
  corriente: boolean;
  activo: boolean;
  usuarioCreacion: string;
  fechaCreacion: string;
}
