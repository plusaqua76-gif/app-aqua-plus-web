import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.local';
import { Observable, map } from 'rxjs';
import {
  IClienteNovedad,
  IClienteNovedadResponse,
  IClienteNovedadFiltros,
  INovedadPQR,
  IClienteNovedadRespuesta
} from '@interfaces/IClienteNovedad';
import { PQR_CONFIG } from '../config/pqr.config';

@Injectable({
  providedIn: 'root'
})
export class PqrEnterprisesService {

  readonly http = inject(HttpClient);
  readonly apiUrl = `${environment.apiUrl}`;

  getPqrsByEnterprice(enterpriceId: number): Observable<IClienteNovedadResponse> {
    return this.http.get<IClienteNovedadResponse>(`${this.apiUrl}/cliente-novedad/empresa/${enterpriceId}`);
  }

  getPqrsWithFilters(enterpriceId: number, filtros: IClienteNovedadFiltros): Observable<IClienteNovedadResponse> {
    let params = new HttpParams();

    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.tipoNovedad) params = params.set('tipoNovedad', filtros.tipoNovedad);
    if (filtros.cliente) params = params.set('cliente', filtros.cliente);
    if (filtros.fechaInicio) params = params.set('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params = params.set('fechaFin', filtros.fechaFin);
    if (filtros.activo !== undefined) params = params.set('activo', filtros.activo.toString());
    if (filtros.page !== undefined) params = params.set('page', filtros.page.toString());
    if (filtros.size !== undefined) params = params.set('size', filtros.size.toString());

    return this.http.get<IClienteNovedadResponse>(`${this.apiUrl}/cliente-novedad/empresa/${enterpriceId}`, { params });
  }


  getPqrById(novedadId: number): Observable<IClienteNovedad> {
    return this.http.get<IClienteNovedad>(`${this.apiUrl}/cliente-novedad/${novedadId}`);
  }

  createPqr(novedad: Partial<IClienteNovedad>): Observable<IClienteNovedad> {
    return this.http.post<IClienteNovedad>(`${this.apiUrl}/cliente-novedad`, novedad);
  }

  updatePqr(novedadId: number, cambios: Partial<IClienteNovedad>): Observable<IClienteNovedad> {
    return this.http.put<IClienteNovedad>(`${this.apiUrl}/cliente-novedad/${novedadId}`, cambios);
  }

  changeEstadoPqr(novedadId: number, estadoId: number, usuario: string): Observable<IClienteNovedad> {
    const body = {
      estadoId,
      usuarioActualizacion: usuario,
      fechaActualizacion: new Date().toISOString()
    };
    return this.http.patch<IClienteNovedad>(`${this.apiUrl}/cliente-novedad/${novedadId}/estado`, body);
  }


  responderPqr(respuesta: IClienteNovedadRespuesta): Observable<IClienteNovedad> {
    return this.http.post<IClienteNovedad>(`${this.apiUrl}/cliente-novedad/${respuesta.novedadId}/responder`, respuesta);
  }

  mapNovedadesToPqrs(novedades: IClienteNovedad[]): INovedadPQR[] {
    return novedades.map(novedad => this.mapNovedadToPqr(novedad));
  }

  private mapNovedadToPqr(novedad: IClienteNovedad): INovedadPQR {
    const cliente = novedad.empresaClienteContador.cliente;
    const nombreCompleto = `${cliente.nombre} ${cliente.segundoNombre || ''} ${cliente.apellido} ${cliente.segundoApellido || ''}`.trim();

    const estado = PQR_CONFIG.ESTADO_MAPPING[novedad.estado.codigo as keyof typeof PQR_CONFIG.ESTADO_MAPPING] || 'Pendiente';
    const prioridad = PQR_CONFIG.PRIORIDAD_MAPPING[novedad.tipoNovedad.novedad as keyof typeof PQR_CONFIG.PRIORIDAD_MAPPING] ||
                     PQR_CONFIG.PRIORIDAD_MAPPING.Default;

    return {
      id: novedad.id,
      tipo: novedad.tipoNovedad.novedad,
      cliente: nombreCompleto,
      documento: `CLI-${cliente.id}`,
      descripcion: novedad.descripcion,
      fecha: novedad.fechaCreacion || new Date().toISOString(),
      estado: estado,
      prioridad: prioridad,
      serial: novedad.empresaClienteContador.contador.serial,
      clienteId: cliente.id,
      contadorId: novedad.empresaClienteContador.contador.id,
      empresaClienteContadorId: novedad.empresaClienteContador.id
    };
  }


  getPqrsForSecretary(enterpriceId: number): Observable<INovedadPQR[]> {
    return this.getPqrsByEnterprice(enterpriceId).pipe(
      map(response => this.mapNovedadesToPqrs(response.response))
    );
  }


  getFilteredPqrsForSecretary(enterpriceId: number, filtros: IClienteNovedadFiltros): Observable<INovedadPQR[]> {
    return this.getPqrsWithFilters(enterpriceId, filtros).pipe(
      map(response => this.mapNovedadesToPqrs(response.response))
    );
  }


  getEstadisticas(enterpriceId: number): Observable<any> {
    return this.getPqrsByEnterprice(enterpriceId).pipe(
      map(response => {
        const novedades = response.response;

        return {
          total: novedades.length,
          pendientes: novedades.filter(n => n.estado.codigo === 'EST_PEN').length,
          enProceso: novedades.filter(n => n.estado.codigo === 'EST_PRO').length,
          resueltos: novedades.filter(n => n.estado.codigo === 'EST_RES').length,
          cerrados: novedades.filter(n => n.estado.codigo === 'EST_CER').length,
          porTipo: this.contarPorTipo(novedades),
          activos: novedades.filter(n => n.activo).length,
          inactivos: novedades.filter(n => !n.activo).length
        };
      })
    );
  }

  private contarPorTipo(novedades: IClienteNovedad[]): { [key: string]: number } {
    const conteo: { [key: string]: number } = {};
    novedades.forEach(novedad => {
      const tipo = novedad.tipoNovedad.novedad;
      conteo[tipo] = (conteo[tipo] || 0) + 1;
    });

    return conteo;
  }
}
