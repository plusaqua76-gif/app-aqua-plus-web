export interface RequestStartPyment {
  idUsuario: number;
  montoCentavos: number;
  emailCliente: string;
  telefono?: string;
  idFactura?: number;
  idEmpresa?: number;
}
