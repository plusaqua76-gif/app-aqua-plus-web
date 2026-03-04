import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@interfaces/Iresponse';
import { ICreateRole, IRoleMenu } from '@interfaces/menu/IRoleMenu';
import { IUserBill } from '@interfaces/IuserBill';
import { IRoleMenuResponse } from '@interfaces/menu/IRoleMenuResponse';


@Injectable({ providedIn: 'root' })
export class ConfigRolesService {

  protected apiUrl = environment.apiUrl
  protected readonly http = inject(HttpClient);

  getAllMenuRoles(): Observable<ApiResponse<IRoleMenu[]>> {
    return this.http.get<ApiResponse<IRoleMenu[]>>(`${this.apiUrl}/menu/all`);
  }

  getUsersEnterprice(IdEnterprice: number): Observable<ApiResponse<IUserBill[]>> {
    return this.http.get<ApiResponse<IUserBill[]>>(`${this.apiUrl}/usuario/empresa?empresaId=${IdEnterprice}`);
  }

  getAllRoles(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/rol/all`);
  }

  getmenuByRole(enterpriceId: number, rolId: number): Observable<ApiResponse<IRoleMenuResponse[]>> {
    return this.http.get<ApiResponse<IRoleMenuResponse[]>>(`${this.apiUrl}/rol-menu/empresa?empresaId=${enterpriceId}&rolId=${rolId}`);
  }

  getMenusAll(): Observable<ApiResponse<IRoleMenuResponse[]>> {
    return this.http.get<ApiResponse<IRoleMenuResponse[]>>(`${this.apiUrl}/rol-menu/all`);
  }

  createRole(roleData: {  // crear interfaz no dejar eso asi
    rolId: number;
    empresaId: number;
    menuIds: number[];
    usuarioCreacion: string
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/rol-menu/rol-menu`, roleData);
  }

  createTypeRol(rol: ICreateRole): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/rol`, rol);
  }



//   {
//   "rolId": 25,
//   "empresaId": 14,
//   "menuIds": [
//     1,2,3,4,5
//   ],
//   "usuarioCreacion": "npeñafiel"
// }'





  updateUserRole(userId: number, rolId: number): Observable<ApiResponse<any>> {
    const payload = {
      id: userId,
      rol: { id: rolId }
    };
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/usuario`, payload);
  }
}

