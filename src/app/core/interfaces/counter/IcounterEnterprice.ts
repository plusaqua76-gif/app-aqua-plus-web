export interface CreateCounterEnterprice {
  empresaContador: {
    empresa: {
      id: number;
    },
    contador: {
      id: number;
    },
    usuarioCreacion: string;
  },
  lectura: {
    lectura: number;
    fechaLectura: string;
    consumoAnormal: boolean;
    descripcion: string;
    activo: boolean;
    usuarioCreacion: string;
  }
}

