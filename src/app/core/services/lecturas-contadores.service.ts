import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

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
  };
}

@Injectable({
  providedIn: 'root'
})
export class LecturasContadoresService {

  private mockData: LecturasData = {
    veredas: [
      {
        nombre: 'Pedregal',
        contadoresTotal: 150,
        contadoresLeidos: 150,
        contadoresPendientes: 0,
        porcentajeCompletado: 100,
        estado: 'completada',
        personasTotal: 450,
        personasCompletadas: 450,
        personasPendientes: 0,
        ultimaLectura: '15/12/2024'
      },
      {
        nombre: 'Libertad',
        contadoresTotal: 120,
        contadoresLeidos: 120,
        contadoresPendientes: 0,
        porcentajeCompletado: 100,
        estado: 'completada',
        personasTotal: 360,
        personasCompletadas: 360,
        personasPendientes: 0,
        ultimaLectura: '14/12/2024'
      },
      {
        nombre: 'Obrero',
        contadoresTotal: 85,
        contadoresLeidos: 85,
        contadoresPendientes: 0,
        porcentajeCompletado: 100,
        estado: 'completada',
        personasTotal: 255,
        personasCompletadas: 255,
        personasPendientes: 0,
        ultimaLectura: '13/12/2024'
      },
      {
        nombre: 'Morelia',
        contadoresTotal: 95,
        contadoresLeidos: 60,
        contadoresPendientes: 35,
        porcentajeCompletado: 63,
        estado: 'pendiente',
        personasTotal: 285,
        personasCompletadas: 180,
        personasPendientes: 105,
        ultimaLectura: '28/08/2025'
      },
      {
        nombre: 'Palmar',
        contadoresTotal: 110,
        contadoresLeidos: 45,
        contadoresPendientes: 65,
        porcentajeCompletado: 41,
        estado: 'pendiente',
        personasTotal: 330,
        personasCompletadas: 135,
        personasPendientes: 195,
        ultimaLectura: '25/08/2025'
      },
      {
        nombre: 'Cedro',
        contadoresTotal: 75,
        contadoresLeidos: 20,
        contadoresPendientes: 55,
        porcentajeCompletado: 27,
        estado: 'pendiente',
        personasTotal: 225,
        personasCompletadas: 60,
        personasPendientes: 165,
        ultimaLectura: '20/08/2025'
      },
      {
        nombre: 'Pitas',
        contadoresTotal: 60,
        contadoresLeidos: 35,
        contadoresPendientes: 25,
        porcentajeCompletado: 58,
        estado: 'pendiente',
        personasTotal: 180,
        personasCompletadas: 105,
        personasPendientes: 75,
        ultimaLectura: '30/08/2025'
      }
    ],
    resumen: {
      totalVeredas: 7,
      veredasCompletadas: 3,
      veredasPendientes: 4,
      totalContadores: 695,
      contadoresCompletados: 515,
      contadoresPendientes: 180,
      totalPersonas: 2085,
      personasCompletadas: 1545,
      personasPendientes: 540,
      porcentajeGeneral: 43 // 3/7 = 42.8% ≈ 43%
    }
  };

  /**
   * Obtiene los datos de lecturas de contadores por veredas
   */
  getLecturasData(): Observable<LecturasData> {
    return of(this.mockData).pipe(
      delay(500)
    );
  }

  /**
   * Obtiene datos filtrados por estado de la vereda
   */
  getLecturasByEstado(estado: 'completada' | 'pendiente' | 'todas'): Observable<LecturasData> {
    let veredasFiltradas = this.mockData.veredas;

    if (estado !== 'todas') {
      veredasFiltradas = this.mockData.veredas.filter(v => v.estado === estado);
    }

    const dataFiltrada: LecturasData = {
      veredas: veredasFiltradas,
      resumen: {
        totalVeredas: veredasFiltradas.length,
        veredasCompletadas: veredasFiltradas.filter(v => v.estado === 'completada').length,
        veredasPendientes: veredasFiltradas.filter(v => v.estado === 'pendiente').length,
        totalContadores: veredasFiltradas.reduce((acc, v) => acc + v.contadoresTotal, 0),
        contadoresCompletados: veredasFiltradas.reduce((acc, v) => acc + v.contadoresLeidos, 0),
        contadoresPendientes: veredasFiltradas.reduce((acc, v) => acc + v.contadoresPendientes, 0),
        totalPersonas: veredasFiltradas.reduce((acc, v) => acc + v.personasTotal, 0),
        personasCompletadas: veredasFiltradas.reduce((acc, v) => acc + v.personasCompletadas, 0),
        personasPendientes: veredasFiltradas.reduce((acc, v) => acc + v.personasPendientes, 0),
        porcentajeGeneral: veredasFiltradas.length > 0 ?
          Math.round((veredasFiltradas.filter(v => v.estado === 'completada').length / veredasFiltradas.length) * 100) : 0
      }
    };

    return of(dataFiltrada).pipe(
      delay(300)
    );
  }

  actualizarLecturas(): Observable<LecturasData> {
    const veredasActualizadas = this.mockData.veredas.map(vereda => {
      if (vereda.estado === 'pendiente' && Math.random() > 0.5) {
        const contadoresNuevos = Math.floor(Math.random() * vereda.contadoresTotal);
        const contadoresLeidos = Math.min(vereda.contadoresTotal, contadoresNuevos);
        const contadoresPendientes = vereda.contadoresTotal - contadoresLeidos;
        const porcentajeCompletado = Math.round((contadoresLeidos / vereda.contadoresTotal) * 100);

        // Calcular personas (asumiendo 3 personas por contador)
        const personasCompletadas = contadoresLeidos * 3;
        const personasPendientes = contadoresPendientes * 3;

        return {
          ...vereda,
          contadoresLeidos,
          contadoresPendientes,
          porcentajeCompletado,
          personasCompletadas,
          personasPendientes,
          estado: contadoresLeidos === vereda.contadoresTotal ? 'completada' as const : 'pendiente' as const
        };
      }
      return vereda;
    });

    // Recalcular resumen
    const veredasCompletadas = veredasActualizadas.filter(v => v.estado === 'completada').length;
    const veredasPendientes = veredasActualizadas.filter(v => v.estado === 'pendiente').length;

    const dataActualizada: LecturasData = {
      veredas: veredasActualizadas,
      resumen: {
        totalVeredas: veredasActualizadas.length,
        veredasCompletadas,
        veredasPendientes,
        totalContadores: veredasActualizadas.reduce((acc, v) => acc + v.contadoresTotal, 0),
        contadoresCompletados: veredasActualizadas.reduce((acc, v) => acc + v.contadoresLeidos, 0),
        contadoresPendientes: veredasActualizadas.reduce((acc, v) => acc + v.contadoresPendientes, 0),
        totalPersonas: veredasActualizadas.reduce((acc, v) => acc + v.personasTotal, 0),
        personasCompletadas: veredasActualizadas.reduce((acc, v) => acc + v.personasCompletadas, 0),
        personasPendientes: veredasActualizadas.reduce((acc, v) => acc + v.personasPendientes, 0),
        porcentajeGeneral: Math.round((veredasCompletadas / veredasActualizadas.length) * 100)
      }
    };

    this.mockData = dataActualizada;
    return of(dataActualizada).pipe(
      delay(200)
    );
  }

  /**
   * Obtiene las veredas disponibles según el filtro de estado
   */
  getVeredasDisponibles(estado: 'completada' | 'pendiente' | 'todas'): string[] {
    if (estado === 'todas') {
      return this.mockData.veredas.map(v => v.nombre);
    }
    return this.mockData.veredas
      .filter(v => v.estado === estado)
      .map(v => v.nombre);
  }

  /**
   * Obtiene datos para el gráfico radial (porcentajes por vereda)
   */
  getRadialChartData(): Observable<{series: number[], labels: string[], colors: string[]}> {
    const veredasCompletadas = this.mockData.veredas.filter(v => v.estado === 'completada');
    const veredasPendientes = this.mockData.veredas.filter(v => v.estado === 'pendiente');

    const data = {
      series: [
        veredasCompletadas.length > 0 ? Math.round((veredasCompletadas.length / this.mockData.veredas.length) * 100) : 0,
        veredasPendientes.length > 0 ? Math.round((veredasPendientes.length / this.mockData.veredas.length) * 100) : 0
      ],
      labels: ['Veredas Completadas', 'Veredas Pendientes'],
      colors: ['#1C64F2', '#FDBA8C'] // Azul para completadas, Naranja para pendientes
    };

    return of(data).pipe(
      delay(200)
    );
  }
}
