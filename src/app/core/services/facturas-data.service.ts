import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { IFacturasData } from '@interfaces/IFacturasData';

@Injectable({
  providedIn: 'root'
})
export class FacturasDataService {

  private mockData: IFacturasData = {
    "xAxis": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"],
    "yAxis": {
      "facturasPagadas": [120, 140, 135, 145, 130, 150],
      "facturasPendientes": [80, 95, 85, 100, 110, 90]
    }
  };


  getFacturasData(): Observable<IFacturasData> {

    return of(this.mockData).pipe(
      delay(500) // latencia de red
    );
  }

  /**
   * Obtiene datos específicos para un rango de fechas
   * @param startMonth - mes de inicio (0-11)
   * @param endMonth - mes de fin (0-11)
   * @returns Observable con los datos filtrados
   */
  getFacturasDataByRange(startMonth: number, endMonth: number): Observable<IFacturasData> {
    const filteredData: IFacturasData = {
      xAxis: this.mockData.xAxis.slice(startMonth, endMonth + 1),
      yAxis: {
        facturasPagadas: this.mockData.yAxis.facturasPagadas.slice(startMonth, endMonth + 1),
        facturasPendientes: this.mockData.yAxis.facturasPendientes.slice(startMonth, endMonth + 1)
      }
    };

    return of(filteredData).pipe(
      delay(300)
    );
  }


  updateMockData(): Observable<IFacturasData> {
    const updatedData: IFacturasData = {
      ...this.mockData,
      yAxis: {
        facturasPagadas: this.mockData.yAxis.facturasPagadas.map(value =>
          Math.max(0, value + Math.floor(Math.random() * 21) - 10) // +/- 10
        ),
        facturasPendientes: this.mockData.yAxis.facturasPendientes.map(value =>
          Math.max(0, value + Math.floor(Math.random() * 11) - 5) // +/- 5
        )
      }
    };

    this.mockData = updatedData;
    return of(updatedData).pipe(
      delay(200)
    );
  }
}
