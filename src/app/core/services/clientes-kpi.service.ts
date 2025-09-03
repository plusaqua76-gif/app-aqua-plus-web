import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { IClienteKPI } from '@interfaces/IClienteKPI';

@Injectable({
  providedIn: 'root'
})
export class ClientesKpiService {

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
