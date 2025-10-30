export interface ILecturasResponse {
  code: number;
  message: string;
  success: boolean;
  response: {
    filtros: {
      id_ciudad: number;
      id_corregimiento?: number;
    };
    periodo: {
      mes: number;
      anio: number;
      desde: string;
      hasta: string;
    };
    resumen: {
      totalLeidosCiudad: number;
      ultimaActualizacion: string;
      contadoresConLectura: number;
      contadoresSinLectura: number;
      totalSinLecturaCiudad: number;
      totalContadoresFiltrados: number;
    };
    empresa_id: number;
    totalesPorCorregimiento: ITotalCorregimiento[];
  };
}

export interface ITotalCorregimiento {
  ciudad: string;
  idCiudad: number;
  corregimiento: string;
  idCorregimiento: number;
  contadoresConLectura: number;
  contadoresSinLectura: number;
}

// Las interfaces de contadores individuales ya no son necesarias
// La nueva API devuelve totales por corregimiento en lugar de contadores individuales
