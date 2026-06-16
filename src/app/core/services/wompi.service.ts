import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '@interfaces/Iresponse';
import { IEmpresaWompi, IEmpresaWompiRequest } from '@interfaces/pyment/empresa-wompi';

interface WompiData {
  sessionId: string;
  deviceData: { deviceID: string };
}

interface WompiGlobal {
  initialize(callback: (data: WompiData, error: string | null) => void): void;
}

declare const $wompi: WompiGlobal;

@Injectable({ providedIn: 'root' })
export class WompiService {
  readonly sessionId = signal<string | null>(null);
  readonly deviceId = signal<string | null>(null);

  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  guardarConfigWompi(config: IEmpresaWompiRequest): Observable<ApiResponse<IEmpresaWompi>> {
    return this.http.post<ApiResponse<IEmpresaWompi>>(`${this.apiUrl}/empresa-wompi`, config);
  }

  obtenerConfigWompi(idEmpresa: number): Observable<ApiResponse<IEmpresaWompi>> {
    return this.http.get<ApiResponse<IEmpresaWompi>>(`${this.apiUrl}/empresa-wompi/${idEmpresa}`);
  }

  initialize(): Promise<{ sessionId: string; deviceId: string }> {
    return new Promise((resolve, reject) => {
      if (typeof $wompi === 'undefined') {
        reject(
          new Error(
            'La librería Wompi JS no está disponible. Verifica el script en index.html.',
          ),
        );
        return;
      }

      $wompi.initialize((data, error) => {
        if (error !== null) {
          reject(new Error(`Error al inicializar Wompi: ${error}`));
          return;
        }

        this.sessionId.set(data.sessionId);
        this.deviceId.set(data.deviceData.deviceID);

        resolve({
          sessionId: data.sessionId,
          deviceId: data.deviceData.deviceID,
        });
      });
    });
  }
}
