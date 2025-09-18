import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { IFacturasData } from '@interfaces/IFacturasData';
import { IFacturasMesResponse, IFacturasAnualResponse } from '@interfaces/IFacturasMesResponse';
import { environment } from '../../environments/environment.local';

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
        // Si es respuesta anual (array de meses)
        if ('meses' in response) {
          return this.mapAnualResponseToChart(response as IFacturasAnualResponse);
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

    // Ordenar meses por número de mes
    const mesesOrdenados = response.meses.sort((a, b) => a.periodo.mes - b.periodo.mes);

    mesesOrdenados.forEach(mesData => {
      xAxis.push(meses[mesData.periodo.mes - 1]);
      facturasPagadas.push(mesData.facturasPagadas.total);
      facturasPendientes.push(mesData.facturasPendientes.total);
      facturasVencidas.push(mesData.facturasVencidas.total);
    });

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

    meses.forEach(mesData => {
      xAxis.push(nombresMeses[mesData.periodo.mes - 1]);
      facturasPagadas.push(mesData.facturasPagadas.total);
      facturasPendientes.push(mesData.facturasPendientes.total);
      facturasVencidas.push(mesData.facturasVencidas.total);
    });

    return {
      xAxis,
      yAxis: {
        facturasPagadas,
        facturasPendientes,
        facturasVencidas
      }
    };
}
}
