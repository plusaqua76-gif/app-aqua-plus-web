export interface ICounter {
  cliente?: {
    id: number;
  };
  tipoContador: {
    id: number;
  };
  descripcion: {
    id: number;
  };
  serial: string;
  fechaInstalacion: string;
  activo: boolean;
  usuarioCreacion: string;
}
