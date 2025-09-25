import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.local';
import { Router } from 'express';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@interfaces/Iresponse';
import { IRoleMenu } from '@interfaces/menu/IRoleMenu';

@Injectable({ providedIn: 'root' })
export class ConfigRolesService {

  protected apiUrl = environment.apiUrl
  protected readonly router = inject(Router);
  protected readonly http = inject(HttpClient);

  getAllMenuRoles(): Observable<ApiResponse<IRoleMenu[]>> {
    return this.http.get<ApiResponse<IRoleMenu[]>>(`${this.apiUrl}/role-menu/all`);
  }

}
