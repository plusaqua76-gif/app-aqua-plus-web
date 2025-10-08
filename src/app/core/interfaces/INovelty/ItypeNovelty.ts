export interface ITypeNovelty {
  id?: number;
  novedad: string;
  descripcion: string;
  activo: boolean;
  usuarioCreacion: string;
}

export interface ITypeNoveltyResponse {
  success: boolean;
  message: string;
  code: number;
  response: ITypeNovelty;
}
