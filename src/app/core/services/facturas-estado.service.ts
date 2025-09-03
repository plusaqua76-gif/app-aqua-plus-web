import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { IFacturasEstado, IFacturasEstadoData } from '@interfaces/IFacturasEstado';

@Injectable({
  providedIn: 'root'
})
export class FacturasEstadoService {

  private mockData: IFacturasEstado = {
    pagadas: 850,
    pendientes: 250,
    vencidas: 100,
    total: 1200
  };


  getFacturasEstadoData(): Observable<IFacturasEstadoData> {
    const porcentajes = this.calcularPorcentajes(this.mockData);

    const data: IFacturasEstadoData = {
      facturas: this.mockData,
      porcentajes
    };

    return of(data).pipe(
      delay(500) //  latencia de red
    );
  }

  /**
   * Obtiene datos específicos para un rango de fechas
   * @param period - período seleccionado
   * @returns Observable con los datos filtrados
   */
  getFacturasEstadoByPeriod(period: string): Observable<IFacturasEstadoData> {
    let filteredData: IFacturasEstado;

    switch(period) {
      case 'Enero': {
        filteredData = {
          pagadas: 720,
          pendientes: 180,
          vencidas: 100,
          total: 1000
        };
        break;
      }
      case 'Febrero': {
        filteredData = {
          pagadas: 810,
          pendientes: 150,
          vencidas: 90,
          total: 1050
        };
        break;
      }
      case 'Marzo': {
        filteredData = {
          pagadas: 765,
          pendientes: 200,
          vencidas: 135,
          total: 1100
        };
        break;
      }
      case 'Abril': {
        filteredData = {
          pagadas: 850,
          pendientes: 220,
          vencidas: 80,
          total: 1150
        };
        break;
      }
      case 'Mayo': {
        filteredData = {
          pagadas: 920,
          pendientes: 190,
          vencidas: 90,
          total: 1200
        };
        break;
      }
      case 'Junio': {
        filteredData = this.mockData; // Datos actuales
        break;
      }
      case 'Julio': {
        filteredData = {
          pagadas: 780,
          pendientes: 300,
          vencidas: 120,
          total: 1200
        };
        break;
      }
      case 'Agosto': {
        filteredData = {
          pagadas: 890,
          pendientes: 250,
          vencidas: 110,
          total: 1250
        };
        break;
      }
      case 'Septiembre': {
        filteredData = {
          pagadas: 950,
          pendientes: 200,
          vencidas: 100,
          total: 1250
        };
        break;
      }
      case 'Octubre': {
        filteredData = {
          pagadas: 820,
          pendientes: 280,
          vencidas: 150,
          total: 1250
        };
        break;
      }
      case 'Noviembre': {
        filteredData = {
          pagadas: 900,
          pendientes: 240,
          vencidas: 110,
          total: 1250
        };
        break;
      }
      case 'Diciembre': {
        filteredData = {
          pagadas: 1000,
          pendientes: 150,
          vencidas: 100,
          total: 1250
        };
        break;
      }
      default: {
        filteredData = this.mockData;
      }
    }

    const porcentajes = this.calcularPorcentajes(filteredData);

    const data: IFacturasEstadoData = {
      facturas: filteredData,
      porcentajes
    };

    return of(data).pipe(
      delay(300)
    );
  }


  updateMockData(): Observable<IFacturasEstadoData> {
    // Generamos un total base aleatorio entre 1000 y 1500
    const total = Math.floor(Math.random() * 500) + 1000;

    const pagadasPercent = Math.random() * 0.3 + 0.6; // 60-90%
    const vencidasPercent = Math.random() * 0.15 + 0.05; // 5-20%

    const newMockData: IFacturasEstado = {
      pagadas: Math.floor(total * pagadasPercent),
      vencidas: Math.floor(total * vencidasPercent),
      pendientes: 0, // Se calculará después
      total
    };

    // Calcular pendientes para que la suma sea exacta
    newMockData.pendientes = total - newMockData.pagadas - newMockData.vencidas;

    this.mockData = newMockData;

    const porcentajes = this.calcularPorcentajes(newMockData);

    const data: IFacturasEstadoData = {
      facturas: newMockData,
      porcentajes
    };

    return of(data).pipe(
      delay(300)
    );
  }

  /**
   * Calcula los porcentajes de cada estado
   * @param data - datos de facturas
   * @returns porcentajes calculados
   */
  private calcularPorcentajes(data: IFacturasEstado): { pagadas: number; pendientes: number; vencidas: number } {
    if (data.total === 0) {
      return { pagadas: 0, pendientes: 0, vencidas: 0 };
    }

    return {
      pagadas: Math.round((data.pagadas / data.total) * 100 * 10) / 10, // Un decimal
      pendientes: Math.round((data.pendientes / data.total) * 100 * 10) / 10,
      vencidas: Math.round((data.vencidas / data.total) * 100 * 10) / 10
    };
  }

  /**
   * Calcula la tasa de efectividad del recaudo
   * @returns número que representa el porcentaje de efectividad
   */
  calcularEfectividadRecaudo(): number {
    const facturasGestionadas = this.mockData.pagadas + this.mockData.vencidas;
    return Math.round((this.mockData.pagadas / facturasGestionadas) * 100);
  }
}
