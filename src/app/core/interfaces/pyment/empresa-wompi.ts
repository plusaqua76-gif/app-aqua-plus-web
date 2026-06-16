export interface IEmpresaWompi {
  id?: number;
  idEmpresa: number;
  clavePublica: string;
  clavePrivada: string;
  secretoIntegridad: string;
}

export interface IEmpresaWompiRequest {
  idEmpresa: number;
  clavePublica: string;
  clavePrivada: string;
  secretoIntegridad: string;
  usuarioCreacion: string;
}
