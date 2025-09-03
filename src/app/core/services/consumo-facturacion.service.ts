import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { IConsumoFacturacion } from '@interfaces/IConsumoFacturacion';

@Injectable({
  providedIn: 'root'
})
export class ConsumoFacturacionService {

  private mockData: IConsumoFacturacion = {
    "xAxis": ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    "yAxis": {
      "consumoM3": [150, 180, 165, 195, 220, 240, 190],
      "facturadoPesos": [230000, 280000, 255000, 305000, 340000, 370000, 295000]
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
      case 'Último día': {
        filteredData = {
          xAxis: ['Hoy'],
          yAxis: {
            consumoM3: [190],
            facturadoPesos: [295000]
          }
        };
        break;
      }
      case 'Últimos 3 días': {
        filteredData = {
          xAxis: ['Vie', 'Sáb', 'Dom'],
          yAxis: {
            consumoM3: [220, 240, 190],
            facturadoPesos: [340000, 370000, 295000]
          }
        };
        break;
      }
      case 'Últimos 7 días': {
        filteredData = this.mockData;
        break;
      }
      case 'Últimos 30 días': {
        const dias30 = Array.from({length: 30}, (_, i) => `Día ${i + 1}`);
        const consumo30 = Array.from({length: 30}, () => Math.floor(Math.random() * 100) + 150);
        const facturado30 = consumo30.map(c => c * (Math.random() * 800 + 1200));
        filteredData = {
          xAxis: dias30,
          yAxis: {
            consumoM3: consumo30,
            facturadoPesos: facturado30
          }
        };
        break;
      }
      case 'Últimos 90 días': {
        const semanas = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8', 'Sem 9', 'Sem 10', 'Sem 11', 'Sem 12'];
        const consumoSem = semanas.map(() => Math.floor(Math.random() * 1000) + 1200);
        const facturadoSem = consumoSem.map(c => c * (Math.random() * 800 + 1200));
        filteredData = {
          xAxis: semanas,
          yAxis: {
            consumoM3: consumoSem,
            facturadoPesos: facturadoSem
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
      xAxis: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
      yAxis: {
        consumoM3: [
          Math.floor(Math.random() * 100) + 120,
          Math.floor(Math.random() * 100) + 140,
          Math.floor(Math.random() * 100) + 130,
          Math.floor(Math.random() * 100) + 160,
          Math.floor(Math.random() * 100) + 180,
          Math.floor(Math.random() * 100) + 200,
          Math.floor(Math.random() * 100) + 150
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
