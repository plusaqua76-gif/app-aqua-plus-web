import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { IClienteKPI } from '@interfaces/IClienteKPI';
import { IClienteKPIResponse } from '@interfaces/IClienteKPIResponse';

@Injectable({
  providedIn: 'root'
})
export class ClientesKpiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://app-aqua-plus-api.azurewebsites.net/api/v1';

  private mockData: IClienteKPI[] = [
    {
      id: 'clientes-nuevos',
      titulo: 'Clientes Nuevos',
      valor: 156,
      porcentajeCambio: 12.5,
      esPositivo: true,
      progreso: 78,
      icono: 'user-plus',
      descripcion: 'Este mes'
    },
    {
      id: 'clientes-al-dia',
      titulo: 'Clientes al Día',
      valor: 1847,
      porcentajeCambio: 3.2,
      esPositivo: true,
      progreso: 92,
      icono: 'check-circle',
      descripcion: 'Pagos actualizados'
    },
    {
      id: 'clientes-mora',
      titulo: 'Clientes en Mora',
      valor: 234,
      porcentajeCambio: -8.1,
      esPositivo: false,
      progreso: 35,
      icono: 'exclamation-triangle',
      descripcion: 'Requieren gestión'
    },
    {
      id: 'clientes-activos',
      titulo: 'Clientes Activos',
      valor: 2081,
      porcentajeCambio: 2.8,
      esPositivo: true,
      progreso: 88,
      icono: 'users',
      descripcion: 'Total general'
    }
  ];

  /**
   * Obtiene los KPIs de clientes desde el API dinámico
   * @param empresaId ID de la empresa
   * @param anio Año actual
   * @param mes Mes actual
   * @param rangoPor Criterio de rango (emision o vencimiento)
   * @param exclusivo Si debe ser exclusivo al día
   * @returns Observable con la respuesta del API
   */
  getClientesKPIDinamico(
    empresaId: number,
    anio: number,
    mes: number,
    rangoPor: 'emision' | 'vencimiento' = 'emision',
    exclusivo: boolean = false
  ): Observable<IClienteKPIResponse> {
    const params = {
      empresaId: empresaId.toString(),
      anio: anio.toString(),
      mes: mes.toString(),
      rangoPor,
      exclusivo: exclusivo.toString()
    };

    return this.http.get<IClienteKPIResponse>(
      `${this.baseUrl}/empresa-cliente-contador/clientes-empresa-mes`,
      { params }
    );
  }

  /**
   * Convierte la respuesta del API a formato IClienteKPI[]
   * @param response Respuesta del API
   * @returns Array de KPIs en formato IClienteKPI
   */
  mapResponseToKPIs(response: IClienteKPIResponse): IClienteKPI[] {
    const resumen = response.resumen;

    return [
      {
        id: 'clientes-nuevos',
        titulo: 'Clientes Nuevos',
        valor: resumen.clientes_nuevos,
        porcentajeCambio: resumen.clientes_nuevos > 0 ? 15.2 : 0, // Simulado por ahora
        esPositivo: resumen.clientes_nuevos > 0,
        progreso: resumen.clientes_activos > 0 ?
          Math.min(100, (resumen.clientes_nuevos / resumen.clientes_activos) * 100 * 3) : 0,
        icono: 'user-plus',
        descripcion: 'Este mes'
      },
      {
        id: 'clientes-al-dia',
        titulo: 'Clientes al Día',
        valor: resumen.clientes_al_dia,
        porcentajeCambio: 3.2, // Simulado por ahora
        esPositivo: true,
        progreso: resumen.clientes_activos > 0 ?
          Math.round((resumen.clientes_al_dia / resumen.clientes_activos) * 100) : 0,
        icono: 'check-circle',
        descripcion: 'Pagos actualizados'
      },
      {
        id: 'clientes-mora',
        titulo: 'Clientes en Mora',
        valor: resumen.clientes_en_mora,
        porcentajeCambio: -8.1, // Simulado por ahora
        esPositivo: false,
        progreso: resumen.clientes_activos > 0 ?
          Math.round((resumen.clientes_en_mora / resumen.clientes_activos) * 100) : 0,
        icono: 'exclamation-triangle',
        descripcion: 'Requieren gestión'
      },
      {
        id: 'clientes-activos',
        titulo: 'Clientes Activos',
        valor: resumen.clientes_activos,
        porcentajeCambio: 2.8, // Simulado por ahora
        esPositivo: true,
        progreso: 100, // Los clientes activos representan el 100%
        icono: 'users',
        descripcion: 'Total general'
      }
    ];
  }

  /**
   * Obtiene todos los KPIs de clientes
   * @returns Observable con array de KPIs
   */
  getClientesKPI(): Observable<IClienteKPI[]> {
    return of(this.mockData).pipe(
      delay(300)
    );
  }

  /**
   * Obtiene un KPI específico por ID
   * @param id - ID del KPI a obtener
   * @returns Observable con el KPI específico
   */
  getClienteKPIById(id: string): Observable<IClienteKPI | undefined> {
    const kpi = this.mockData.find(item => item.id === id);
    return of(kpi).pipe(
      delay(200)
    );
  }


  updateMockData(): Observable<IClienteKPI[]> {
    // Generar variaciones realistas
    this.mockData = this.mockData.map(kpi => {
      const variacion = (Math.random() - 0.5) * 0.1; // ±5% de variación
      const nuevoValor = Math.floor(kpi.valor * (1 + variacion));
      const nuevoCambio = (Math.random() - 0.3) * 20; // Tendencia más hacia positivo

      return {
        ...kpi,
        valor: nuevoValor,
        porcentajeCambio: Math.round(nuevoCambio * 10) / 10,
        esPositivo: nuevoCambio > 0,
        progreso: Math.min(100, Math.max(10, kpi.progreso + (Math.random() - 0.5) * 10))
      };
    });

    return of(this.mockData).pipe(
      delay(400)
    );
  }

  /**
   * Calcula el total de clientes activos
   * @returns número total de clientes activos
   */
  getTotalClientesActivos(): number {
    const clientesAlDia = this.mockData.find(k => k.id === 'clientes-al-dia')?.valor || 0;
    const clientesMora = this.mockData.find(k => k.id === 'clientes-mora')?.valor || 0;
    return clientesAlDia + clientesMora;
  }

  /**
   * Calcula el porcentaje de clientes al día
   * @returns porcentaje de clientes al día
   */
  getPorcentajeClientesAlDia(): number {
    const clientesAlDia = this.mockData.find(k => k.id === 'clientes-al-dia')?.valor || 0;
    const total = this.getTotalClientesActivos();
    return total > 0 ? Math.round((clientesAlDia / total) * 100) : 0;
  }

  /**
   * Calcula el porcentaje de morosidad
   * @returns porcentaje de clientes en mora
   */
  getPorcentajeMorosidad(): number {
    const clientesMora = this.mockData.find(k => k.id === 'clientes-mora')?.valor || 0;
    const total = this.getTotalClientesActivos();
    return total > 0 ? Math.round((clientesMora / total) * 100) : 0;
  }
}
