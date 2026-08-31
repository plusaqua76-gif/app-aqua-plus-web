import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { IFacturasData } from '@interfaces/IFacturasData';
import { IFacturasMesResponse, IFacturasAnualResponse } from '@interfaces/IFacturasMesResponse';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FacturasDataService {
  private readonly http = inject(HttpClient);
  readonly baseUrl = environment.apiUrl;

  getFacturasMesDinamico(
    empresaId: number,
    anio: number,
    mes?: number
  ): Observable<IFacturasMesResponse | IFacturasAnualResponse> {
    const params: any = {
      empresaId: empresaId.toString(),
      anio: anio.toString()
    };

    if (mes) {
      params.mes = mes.toString();
    }

    return this.http.get<IFacturasMesResponse | IFacturasAnualResponse>(
      `${this.baseUrl}/factura/factura-mes`,
      { params }
    );
  }

  /**
   * Obtiene datos de facturas anuales y los convierte al formato del gráfico
   * @param empresaId ID de la empresa
   * @param anio Año
   * @returns Observable con datos formateados para el gráfico
   */
  getFacturasDataAnual(
    empresaId: number,
    anio: number
  ): Observable<IFacturasData> {
    return this.getFacturasMesDinamico(empresaId, anio).pipe(
      map((response: IFacturasMesResponse | IFacturasAnualResponse) => {
        // Si es respuesta anual (tiene porMes y periodo.mes es null)
        if ('porMes' in response && response.periodo.mes === null && response.porMes) {
          return this.mapPorMesResponseToChart(response);
        }
        // Si es respuesta de un solo mes
        else {
          return this.mapMensualResponseToChart([response as IFacturasMesResponse]);
        }
      })
    );
  }

  /**
   * Mapea la respuesta anual a formato del gráfico
   */
  private mapAnualResponseToChart(response: IFacturasAnualResponse): IFacturasData {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const xAxis: string[] = [];
    const facturasPagadas: number[] = [];
    const facturasPendientes: number[] = [];
    const facturasVencidas: number[] = [];

    // Verificar si hay meses en la respuesta
    if (!response.meses || response.meses.length === 0) {
      return { xAxis, yAxis: { facturasPagadas, facturasPendientes, facturasVencidas } };
    }

    // Ordenar meses por número de mes
    const mesesOrdenados = [...response.meses].sort((a, b) => (a.periodo.mes || 0) - (b.periodo.mes || 0));

    for (const mesData of mesesOrdenados) {
      if (mesData.periodo.mes === null) continue;
      const nombreMes = meses[mesData.periodo.mes - 1];

      xAxis.push(nombreMes);
      facturasPagadas.push(mesData.facturasPagadas.total);
      facturasPendientes.push(mesData.facturasPendientes.total);
      facturasVencidas.push(mesData.facturasVencidas.total);
    }

    return {
      xAxis,
      yAxis: {
        facturasPagadas,
        facturasPendientes,
        facturasVencidas
      }
    };
  }

  /**
   * Mapea respuesta mensual a formato del gráfico
   */
  private mapMensualResponseToChart(meses: IFacturasMesResponse[]): IFacturasData {
    const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const xAxis: string[] = [];
    const facturasPagadas: number[] = [];
    const facturasPendientes: number[] = [];
    const facturasVencidas: number[] = [];

    let totalMontoPagadas = 0;
    let totalMontoPendientes = 0;
    let totalMontoVencidas = 0;

    for (const mesData of meses) {
      if (mesData.periodo.mes === null) continue;
      const nombreMes = nombresMeses[mesData.periodo.mes - 1];

      xAxis.push(nombreMes);
      facturasPagadas.push(mesData.facturasPagadas.total);
      facturasPendientes.push(mesData.facturasPendientes.total);
      facturasVencidas.push(mesData.facturasVencidas.total);
      totalMontoPagadas    += mesData.facturasPagadas.totalMonto    ?? 0;
      totalMontoPendientes += mesData.facturasPendientes.totalMonto ?? 0;
      totalMontoVencidas   += mesData.facturasVencidas.totalMonto   ?? 0;
    }

    return {
      xAxis,
      yAxis: {
        facturasPagadas,
        facturasPendientes,
        facturasVencidas
      },
      totalMontoPagadas,
      totalMontoPendientes,
      totalMontoVencidas,
      totalMontoRecaudado: totalMontoPagadas,
    };
  }

  /**
   * Mapea respuesta con datos porMes a formato del gráfico
   */
  private mapPorMesResponseToChart(response: IFacturasMesResponse): IFacturasData {
    const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const xAxis: string[] = [];
    const facturasPagadas: number[] = [];
    const facturasPendientes: number[] = [];
    const facturasVencidas: number[] = [];

    if (!response.porMes || response.porMes.length === 0) {
      return { xAxis, yAxis: { facturasPagadas, facturasPendientes, facturasVencidas } };
    }

    // Filtrar meses que tienen datos (al menos uno de los totales > 0)
    const mesesConDatos = response.porMes.filter(mesData =>
      mesData.pagadas.total > 0 ||
      mesData.pendientes.total > 0 ||
      mesData.vencidas.total > 0
    );

    // Si no hay meses con datos, mostrar todos los meses para mantener la estructura
    const mesesAMostrar = mesesConDatos.length > 0 ? mesesConDatos : response.porMes;

    let totalMontoPagadas = 0;
    let totalMontoPendientes = 0;
    let totalMontoVencidas = 0;

    for (const mesData of mesesAMostrar) {
      const nombreMes = nombresMeses[mesData.mes - 1];

      xAxis.push(nombreMes);
      facturasPagadas.push(mesData.pagadas.total);
      facturasPendientes.push(mesData.pendientes.total);
      facturasVencidas.push(mesData.vencidas.total);
      totalMontoPagadas    += mesData.pagadas.totalMonto    ?? 0;
      totalMontoPendientes += mesData.pendientes.totalMonto ?? 0;
      totalMontoVencidas   += mesData.vencidas.totalMonto   ?? 0;
    }

    return {
      xAxis,
      yAxis: {
        facturasPagadas,
        facturasPendientes,
        facturasVencidas
      },
      totalMontoPagadas,
      totalMontoPendientes,
      totalMontoVencidas,
      totalMontoRecaudado: totalMontoPagadas,
    };
  }
}
