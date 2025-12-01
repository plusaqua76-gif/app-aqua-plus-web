export interface IUse {
  id: number;
  nombre: string;
  descripcion: string;
  codigo: string;
}

export interface IUseCreate {
  nombre: string;
  empresa: { id: number };
  descripcion: string;
  codigo: string;
  usuarioCreacion: string;
}


export interface IUseUpdate {
  id: number;
  nombre: string;
  usuarioModificacion: string;
}
