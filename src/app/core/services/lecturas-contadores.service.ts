import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ILecturasResponse } from '@interfaces/ILecturasResponse';

export interface VeredaLectura {
  nombre: string;
  contadoresTotal: number;
  contadoresLeidos: number;
  contadoresPendientes: number;
  porcentajeCompletado: number;
  estado: 'completada' | 'pendiente';
  personasTotal: number;
  personasCompletadas: number;
  personasPendientes: number;
  ultimaLectura: string;
}

export interface LecturasData {
  veredas: VeredaLectura[];
  resumen: {
    totalVeredas: number;
    veredasCompletadas: number;
    veredasPendientes: number;
    totalContadores: number;
    contadoresCompletados: number;
    contadoresPendientes: number;
    totalPersonas: number;
    personasCompletadas: number;
    personasPendientes: number;
    porcentajeGeneral: number;
    ultimaActualizacion?: string; // Fecha desde el API
  };
}

@Injectable({
  providedIn: 'root'
})
export class LecturasContadoresService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;

  /**
   * Obtiene las lecturas dinámicamente desde el API
   * @param empresaId ID de la empresa
   * @param ciudadId ID de la ciudad
   * @param corregimientoId ID del corregimiento (opcional) - se agrega como 'idCorregimiento' en la URL
   * @param mes Mes de consulta (opcional)
   * @param anio Año de consulta (opcional)
   */
  getLecturasDinamicas(empresaId: number, ciudadId: number, corregimientoId?: number, mes?: number, anio?: number): Observable<LecturasData> {
    const currentDate = new Date();
    const params: any = {
      empresaId: empresaId,
      anio: anio || currentDate.getFullYear(),
      mes: mes || currentDate.getMonth() + 1,
      idCiudad: ciudadId
    };

    // Agregar idCorregimiento si se proporciona
    if (corregimientoId !== undefined && corregimientoId !== null) {
      params.idCorregimiento = corregimientoId;
    }

    // Construir query params
    const queryParams = new URLSearchParams();
    for (const key of Object.keys(params)) {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key].toString());
      }
    }

    const finalUrl = `${this.apiUrl}/lectura/lecturas-mes?${queryParams.toString()}`;
    return this.http.get<ILecturasResponse>(finalUrl).pipe(
      map((response: ILecturasResponse) => this.transformApiResponseToLecturasData(response))
    );
  }

  /**
   * Transforma la respuesta del API al formato LecturasData
   */
  private transformApiResponseToLecturasData(apiResponse: ILecturasResponse): LecturasData {
    const { response } = apiResponse;

    // Validar que totalesPorCorregimiento existe y no está vacío
    if (!response.totalesPorCorregimiento || response.totalesPorCorregimiento.length === 0) {
      return {
        veredas: [],
        resumen: {
          totalVeredas: 0,
          veredasCompletadas: 0,
          veredasPendientes: 0,
          totalContadores: 0,
          contadoresCompletados: 0,
          contadoresPendientes: 0,
          totalPersonas: 0,
          personasCompletadas: 0,
          personasPendientes: 0,
          porcentajeGeneral: 0,
          ultimaActualizacion: response.resumen.ultimaActualizacion
        }
      };
    }

    // Convertir totalesPorCorregimiento a veredas
    const veredas: VeredaLectura[] = response.totalesPorCorregimiento.map(corregimiento => {
      const contadoresTotal = corregimiento.contadoresConLectura + corregimiento.contadoresSinLectura;
      const porcentajeCompletado = contadoresTotal > 0 ?
        Math.round((corregimiento.contadoresConLectura / contadoresTotal) * 100) : 0;

      return {
        nombre: corregimiento.corregimiento,
        contadoresTotal,
        contadoresLeidos: corregimiento.contadoresConLectura,
        contadoresPendientes: corregimiento.contadoresSinLectura,
        porcentajeCompletado,
        estado: porcentajeCompletado === 100 ? 'completada' : 'pendiente',
        personasTotal: contadoresTotal * 3, // Asumiendo 3 personas por contador
        personasCompletadas: corregimiento.contadoresConLectura * 3,
        personasPendientes: corregimiento.contadoresSinLectura * 3,
        ultimaLectura: response.resumen.ultimaActualizacion ?
          new Date(response.resumen.ultimaActualizacion).toLocaleDateString('es-CO') : 'Sin lectura'
      };
    });

    // Calcular resumen
    const veredasCompletadas = veredas.filter(v => v.estado === 'completada').length;
    const veredasPendientes = veredas.filter(v => v.estado === 'pendiente').length;
    const totalContadores = veredas.reduce((sum, v) => sum + v.contadoresTotal, 0);
    const contadoresCompletados = veredas.reduce((sum, v) => sum + v.contadoresLeidos, 0);
    const contadoresPendientes = veredas.reduce((sum, v) => sum + v.contadoresPendientes, 0);
    const totalPersonas = veredas.reduce((sum, v) => sum + v.personasTotal, 0);
    const personasCompletadas = veredas.reduce((sum, v) => sum + v.personasCompletadas, 0);
    const personasPendientes = veredas.reduce((sum, v) => sum + v.personasPendientes, 0);

    return {
      veredas,
      resumen: {
        totalVeredas: veredas.length,
        veredasCompletadas,
        veredasPendientes,
        totalContadores,
        contadoresCompletados,
        contadoresPendientes,
        totalPersonas,
        personasCompletadas,
        personasPendientes,
        porcentajeGeneral: totalContadores > 0 ?
          Math.round((contadoresCompletados / totalContadores) * 100) : 0,
        ultimaActualizacion: response.resumen.ultimaActualizacion
      }
    };
  }
}
