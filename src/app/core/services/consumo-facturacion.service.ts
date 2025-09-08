import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { IConsumoFacturacion } from '@interfaces/IConsumoFacturacion';

@Injectable({
  providedIn: 'root'
})
export class ConsumoFacturacionService {

  private mockData: IConsumoFacturacion = {
    "xAxis": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    "yAxis": {
      "consumoM3": [4500, 4800, 4200, 5100, 5400, 5800, 6200, 5900, 5300, 4900, 4600, 4300],
      "facturadoPesos": [6750000, 7200000, 6300000, 7650000, 8100000, 8700000, 9300000, 8850000, 7950000, 7350000, 6900000, 6450000]
    }
  };

  getConsumoFacturacionData(): Observable<IConsumoFacturacion> {

    return of(this.mockData).pipe(
      delay(500) // latencia de red
    );
  }

  /**
   * Obtiene datos específicos para un rango de fechas
   * @param period - período seleccionado
   * @returns Observable con los datos filtrados
   */
  getConsumoFacturacionByPeriod(period: string): Observable<IConsumoFacturacion> {
    let filteredData: IConsumoFacturacion;

    switch(period) {
      case 'Último mes': {
        const currentMonth = new Date().getMonth();
        const currentMonthName = this.mockData.xAxis[currentMonth];
        filteredData = {
          xAxis: [currentMonthName],
          yAxis: {
            consumoM3: [this.mockData.yAxis.consumoM3[currentMonth]],
            facturadoPesos: [this.mockData.yAxis.facturadoPesos[currentMonth]]
          }
        };
        break;
      }
      case 'Últimos 3 meses': {
        const currentMonth = new Date().getMonth();
        const startMonth = Math.max(0, currentMonth - 2);
        const endMonth = currentMonth;

        filteredData = {
          xAxis: this.mockData.xAxis.slice(startMonth, endMonth + 1),
          yAxis: {
            consumoM3: this.mockData.yAxis.consumoM3.slice(startMonth, endMonth + 1),
            facturadoPesos: this.mockData.yAxis.facturadoPesos.slice(startMonth, endMonth + 1)
          }
        };
        break;
      }
      case 'Últimos 6 meses': {
        const currentMonth = new Date().getMonth();
        const startMonth = Math.max(0, currentMonth - 5);
        const endMonth = currentMonth;

        filteredData = {
          xAxis: this.mockData.xAxis.slice(startMonth, endMonth + 1),
          yAxis: {
            consumoM3: this.mockData.yAxis.consumoM3.slice(startMonth, endMonth + 1),
            facturadoPesos: this.mockData.yAxis.facturadoPesos.slice(startMonth, endMonth + 1)
          }
        };
        break;
      }
      case 'Año completo': {
        filteredData = this.mockData;
        break;
      }
      case 'Primer semestre': {
        filteredData = {
          xAxis: this.mockData.xAxis.slice(0, 6),
          yAxis: {
            consumoM3: this.mockData.yAxis.consumoM3.slice(0, 6),
            facturadoPesos: this.mockData.yAxis.facturadoPesos.slice(0, 6)
          }
        };
        break;
      }
      case 'Segundo semestre': {
        filteredData = {
          xAxis: this.mockData.xAxis.slice(6, 12),
          yAxis: {
            consumoM3: this.mockData.yAxis.consumoM3.slice(6, 12),
            facturadoPesos: this.mockData.yAxis.facturadoPesos.slice(6, 12)
          }
        };
        break;
      }
      default: {
        filteredData = this.mockData;
      }
    }

    return of(filteredData).pipe(
      delay(300)
    );
  }


  updateMockData(): Observable<IConsumoFacturacion> {
    const newMockData: IConsumoFacturacion = {
      xAxis: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
      yAxis: {
        consumoM3: [
          Math.floor(Math.random() * 1000) + 4000, // Enero
          Math.floor(Math.random() * 1000) + 4200, // Febrero
          Math.floor(Math.random() * 1000) + 3900, // Marzo
          Math.floor(Math.random() * 1000) + 4800, // Abril
          Math.floor(Math.random() * 1000) + 5100, // Mayo
          Math.floor(Math.random() * 1000) + 5500, // Junio
          Math.floor(Math.random() * 1000) + 5900, // Julio
          Math.floor(Math.random() * 1000) + 5600, // Agosto
          Math.floor(Math.random() * 1000) + 5000, // Septiembre
          Math.floor(Math.random() * 1000) + 4600, // Octubre
          Math.floor(Math.random() * 1000) + 4300, // Noviembre
          Math.floor(Math.random() * 1000) + 4000  // Diciembre
        ],
        facturadoPesos: []
      }
    };

    // Calcular facturación basada en consumo con variación aleatoria
    newMockData.yAxis.facturadoPesos = newMockData.yAxis.consumoM3.map(consumo => {
      const tarifaBase = 1500; // Tarifa base por m³
      const variacion = Math.random() * 500 + 1000; // Variación entre 1000-1500
      return Math.floor(consumo * (tarifaBase + variacion));
    });

    this.mockData = newMockData;

    return of(newMockData).pipe(
      delay(300)
    );
  }

  /**
   * Calcula el porcentaje de eficiencia entre consumo y facturación
   * @returns número que representa el porcentaje de eficiencia
   */
  calcularEficiencia(): number {
    const totalConsumo = this.mockData.yAxis.consumoM3.reduce((a, b) => a + b, 0);
    const totalFacturado = this.mockData.yAxis.facturadoPesos.reduce((a, b) => a + b, 0);

    // Asumimos una tarifa promedio para calcular el consumo facturado ideal
    const tarifaPromedio = 1500;
    const facturacionIdeal = totalConsumo * tarifaPromedio;

    return Math.round((totalFacturado / facturacionIdeal) * 100);
  }
}
