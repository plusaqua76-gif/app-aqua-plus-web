export interface IBillBackData {
  descripcion: string;
}

export interface IBillBackResponse {
  datos: IBillBackData[];
  empresa: {
    nombre: string;
    nit: string;
    direccion: string;
    telefono?: string;
    email?: string;
  };
}
