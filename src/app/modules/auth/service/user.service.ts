import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.local";
import { END_POINT_SERVICE } from "../../../environments/environment.variables";
import { HttpClient, HttpParams } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { IUpdatePassword, Iuser, IUserResponse } from "@interfaces/Iuser";



@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/${END_POINT_SERVICE.GET_USER}`;
  protected readonly http = inject(HttpClient);

  getUserSignal(id: number): Observable<ApiResponse<IUserResponse>> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<ApiResponse<IUserResponse>>(url);
  }

  recoverPassword(correo: string): Observable<ApiResponse<any>> {
    const params = new HttpParams().set('correo', correo);
    const url = `${this.apiUrl}/${END_POINT_SERVICE.POST_REC_PASS}`;
    return this.http.post<ApiResponse<any>>(url, null, { params });
  }

  updatePasswordByToken(token: string, contrasena: string): Observable<ApiResponse<any>> {
    const url = `${this.apiUrl}/${END_POINT_SERVICE.POST_UPD_PASS}`;
    const headers = {
      token: `${token}`,
      'Content-Type': 'application/json',
    };
    const body = { contrasena };
    return this.http.post<ApiResponse<any>>(url, body, { headers });
  }

  updateUserImage(id: number, imagen: File, usuarioModificacion: string): Observable<ApiResponse<any>> {
    const url = `${this.apiUrl}/${END_POINT_SERVICE.PUT_IMG_USER}/${id}`;
    const formData = new FormData();
    formData.append('imagen', imagen);
    formData.append('usuarioModificacion', usuarioModificacion);
    return this.http.put<ApiResponse<any>>(url, formData);
  }


  getUserById(id: number): Observable<ApiResponse<Iuser>> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<ApiResponse<Iuser>>(url);
  }

  updatePassword(id: number, data: IUpdatePassword): Observable<ApiResponse<any>> {
  const url = `${this.apiUrl}/${END_POINT_SERVICE.PUT_UPD_PASS}/${id}`;
  return this.http.put<ApiResponse<any>>(url, data);
}

getUser(): Iuser | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  sendEmailUsuario(data: any): Observable<ApiResponse<any>> {
    const url = `${this.apiUrl}/${END_POINT_SERVICE.POST_SEND_EMAIL}`;
    return this.http.post<ApiResponse<any>>(url, data)
}
}
