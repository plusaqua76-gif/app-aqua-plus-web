import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.local';
import { Observable } from 'rxjs';
import { ApiResponse } from '@interfaces/Iresponse';
import { NavItem } from '@interfaces/InavItem';


@Injectable({
  providedIn: 'root',
})
export class NavsMenuRolService {

  readonly http = inject(HttpClient);
  readonly apiUrl = `${environment.apiUrl}`

  getNavsMenuRol(enterpriceId: number, rolId: number): Observable<ApiResponse<NavItem[]>> {
    return this.http.get<ApiResponse<NavItem[]>>(`${this.apiUrl}/usuario/menus?empresaId=${enterpriceId}&rolId=${rolId}`);
  }

}
