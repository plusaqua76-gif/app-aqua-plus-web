export interface IEmpresaWompi {
  id?: number;
  idEmpresa: number;
  wompiClavePublica: string;
  wompiSecretoIntegridad?: string;
  wompiSecretoEventos?: string;
  checkoutUrl: string;
  redirectUrl: string;
  activo?: boolean;
}

export interface IEmpresaWompiRequest {
  idEmpresa: number;
  wompiClavePublica: string;
  wompiSecretoIntegridad: string;
  wompiSecretoEventos: string;
  checkoutUrl: string;
  redirectUrl: string;
  activo?: boolean;
  usuarioCreacion: string;
  usuarioModificacion?: string;
}
