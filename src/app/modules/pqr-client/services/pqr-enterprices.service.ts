import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.local';
import { Observable } from 'rxjs';
import { IClienteNovedadResponse } from '@interfaces/IClienteNovedad';

@Injectable({
  providedIn: 'root'
})
export class PqrEnterprisesService {

  readonly http = inject(HttpClient);
  readonly apiUrl = `${environment.apiUrl}`;

  getPqrsForSecretary(enterpriceId: number): Observable<IClienteNovedadResponse> {
    return this.http.get<IClienteNovedadResponse>(`${this.apiUrl}/cliente-novedad/empresa/${enterpriceId}`);
  }
}
