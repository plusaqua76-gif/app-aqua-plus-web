import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.local";
import { END_POINT_SERVICE } from "../../../environments/environment.variables";
import { HttpClient, HttpParams } from "@angular/common/http";
import { catchError, map, Observable, throwError } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { IEstado, ILectura } from "@interfaces/Ifactura";
import { Router } from "@angular/router";
import { LecturaResponse } from "@interfaces/reading/Ireading";

@Injectable({
    providedIn: 'root',
})
export class ReadingService {

    private apiUrl = `${environment.apiUrl}/${END_POINT_SERVICE.GET_LECTURA}`;

    protected readonly http = inject(HttpClient)


    getAllReadingById(id: number): Observable<ApiResponse<LecturaResponse[]>> {
        return this.http.get<ApiResponse<LecturaResponse[]>>(`${this.apiUrl}/empresa/${id}`).pipe(map(response => response));
    }





    private handleError(error: any): Observable<never> {
        let errorMessage = 'An unknown error occurred while loading factura.';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Client Error: ${error.error.message}`;
        } else {
            errorMessage = `Server Error: ${error.status} - ${error.message || ''}`;
            if (error.error && error.error.message) {
                errorMessage = `${errorMessage} - ${error.error.message}`;
            }
        }
        console.error('Error in facturaService:', errorMessage);
        return throwError(() => new Error(errorMessage));
    }

    getLecturaById(id: number): Observable<ApiResponse<ILectura>> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.get<ApiResponse<ILectura>>(url).pipe(
            catchError(this.handleError)
        );
    }

    updateLectura(factura: ILectura): Observable<ApiResponse<ILectura>> {
            return this.http.post<ApiResponse<ILectura>>(this.apiUrl, factura).pipe(
                catchError(this.handleError)
            );
        }

}
