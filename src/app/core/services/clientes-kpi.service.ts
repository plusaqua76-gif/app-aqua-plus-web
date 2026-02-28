import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  IClienteKPIResponse,
  IClienteKPIApiResponse,
} from '@interfaces/IClienteKPIResponse';
import { IBilledConsumptionApiResponse, IBilledConsumptionResponse, IColumnChartData } from '@interfaces/IBilledConsumption';
import { IEmpresaContadorApiResponse, IEmpresaContadorResponse, IEmpresaContadorChartData } from '@interfaces/IEmpresaContadorConsumption';
import { environment } from '../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { IClienteKPIParams } from '@interfaces/charts/kpi-params';

@Injectable({
  providedIn: 'root',
})
export class ClientesKpiService {
  readonly http = inject(HttpClient);
  readonly platformId = inject(PLATFORM_ID);
  readonly apiUrl = `${environment.apiUrl}`;

  getClientesKPIDinamico(
    params: IClienteKPIParams
  ): Observable<IClienteKPIResponse> {
    const queryParams = {
      empresaId: params.empresaId.toString(),
      anio: params.anio.toString(),
      mes: params.mes.toString(),
      rangoPor: params.rangoPor,
      exclusivo: params.exclusivo.toString(),
    };

    return this.http
      .get<IClienteKPIApiResponse>(
        `${this.apiUrl}/empresa-cliente-contador/clientes-empresa-mes`,
        { params: queryParams }
      )
      .pipe(map((apiResponse) => apiResponse.response));
  }

  getBilledConsumption(
    params: IClienteKPIParams
  ): Observable<IClienteKPIResponse> {
    return this.http
      .get<IClienteKPIApiResponse>(
        `${this.apiUrl}/factura/consumo-clientes`,
        {
          params: {
            empresaId: params.empresaId.toString(),
            anio: params.anio.toString(),
            mes: params.mes.toString(),
          },
        }
      )
      .pipe(map((apiResponse) => apiResponse.response));
  }

  /**
   * Obtiene datos de consumo facturación para el gráfico de columnas
   * Si no se proporciona mes, obtiene datos anuales
   */
  getBilledConsumptionForChart(
    empresaId: number,
    anio: number,
    mes?: number
  ): Observable<IColumnChartData> {
    const params: any = {
      empresaId: empresaId.toString(),
      anio: anio.toString()
    };

    if (mes) {
      params.mes = mes.toString();
    }

    return this.http
      .get<IBilledConsumptionApiResponse>(`${this.apiUrl}/factura/consumo-clientes`, { params })
      .pipe(
        map((apiResponse) => {
          const mappedData = this.mapBilledConsumptionToChart(apiResponse.response);
          return mappedData;
        })
      );
  }

  /**
   * Mapea la respuesta del API a formato del gráfico de columnas
   */
  private mapBilledConsumptionToChart(response: IBilledConsumptionResponse): IColumnChartData {
    const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const xAxis: string[] = [];
    const consumoM3: number[] = [];
    const facturadoPesos: number[] = [];

    if (!response.porMes || response.porMes.length === 0) {
      return { xAxis, yAxis: { consumoM3, facturadoPesos } };
    }

    // Para gráficas, mostrar todos los meses para mantener continuidad temporal
    // Verificar si hay al menos un dato válido en todo el año
    const hayDatosValidos = response.porMes.some(mesData =>
      mesData.mcTotal > 0 || mesData.valorTotal > 0
    );

    if (!hayDatosValidos) {
      // Si no hay datos válidos en todo el año, retornar estructura vacía
      return { xAxis, yAxis: { consumoM3, facturadoPesos } };
    }

    // Filtrar solo los meses que tienen datos (consumo > 0 o facturado > 0)
    for (const mesData of response.porMes) {
      // Solo incluir meses con datos válidos
      if (mesData.mcTotal > 0 || mesData.valorTotal > 0) {
        const nombreMes = nombresMeses[mesData.mes - 1];
        xAxis.push(nombreMes);
        consumoM3.push(mesData.mcTotal);
        facturadoPesos.push(mesData.valorTotal);
      }
    }

    return {
      xAxis,
      yAxis: {
        consumoM3,
        facturadoPesos
      }
    };
  }

  getEmpresaContadorConsumption(
    empresaId: number,
    anio: number,
    mes?: number
  ): Observable<IEmpresaContadorChartData> {
    const params: any = {
      empresaId: empresaId.toString(),
      anio: anio.toString()
    };

    if (mes) {
      params.mes = mes.toString();
    }

    return this.http
      .get<IEmpresaContadorApiResponse>(`${this.apiUrl}/empresa-contador/consumo-empresa-mes`, { params })
      .pipe(
        map((apiResponse) => {
          const mappedData = this.mapEmpresaContadorToChart(apiResponse.response);
          return mappedData;
        })
      );
  }

  /**
   * Mapea la respuesta del API empresa-contador a formato del gráfico
   */
  private mapEmpresaContadorToChart(response: IEmpresaContadorResponse): IEmpresaContadorChartData {
    const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const xAxis: string[] = [];
    const consumoEmpresa: number[] = [];
    const consumoClientes: number[] = [];

    if (!response.porMes || response.porMes.length === 0) {
      return { xAxis, yAxis: { consumoEmpresa, consumoClientes } };
    }

    // Filtrar solo los meses que tienen datos (consumo empresa > 0 o consumo clientes > 0)
    for (const mesData of response.porMes) {
      // Solo incluir meses con datos válidos
      if (mesData.mcTotalEmpresa > 0 || mesData.mcTotalClientes > 0) {
        const nombreMes = nombresMeses[mesData.mes - 1];
        xAxis.push(nombreMes);
        consumoEmpresa.push(mesData.mcTotalEmpresa);
        consumoClientes.push(mesData.mcTotalClientes);
      }
    }

    return {
      xAxis,
      yAxis: {
        consumoEmpresa,
        consumoClientes
      }
    };
  }
}
