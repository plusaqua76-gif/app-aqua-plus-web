export interface NovedadRequest {
  novedad: {
    factura: {
      id: number;
    };
    tipoNovedad: {
      id: number;
    };
    empresaClienteContador: {
      id: number;
    };
    estado: {
      id: number;
    };
    descripcion: string;
    activo: boolean;
    usuarioCreacion: string;
  };
  base64File: string;
}
