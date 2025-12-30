export interface IParametroGeneral {
  id: number;
  codigoPadre: string;
  codigo: string;
  descripcion: string;
}


export interface IUpdateNoveltyRequest {
  id: number;
  descripcion: string;
  estado: {
    codigo: string;
  };
}
