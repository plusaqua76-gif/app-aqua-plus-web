import { isPlatformBrowser } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { inject, Injectable, PLATFORM_ID, signal } from "@angular/core";
import { environment } from "../../../environments/environment";
import { rxResource } from "@angular/core/rxjs-interop";
import { ResponseResolutionDian } from "@interfaces/invoice/invoice.interface";
import { ApiResponse } from "@interfaces/Iresponse";
import { catchError, map, of } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ResolutionDianEagerInitializationService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private idEnterprice = signal<number | null>(null);

  private enterpriceDianResource = rxResource({
    params: () => this.idEnterprice(),
    stream: ({ params: idCompany }) => {
      if (!idCompany) return of(null);

      return this.http.get<ApiResponse<ResponseResolutionDian>>(
        `${this.apiUrl}/empresa-dian/resolucion/${idCompany}`
      ).pipe(
        map(response => response.response),
        catchError(() => of(null))
      );
    }
  });

  readonly enterpriceResolutionSignal = this.enterpriceDianResource.value;
  readonly isLoading = this.enterpriceDianResource.isLoading;
  readonly error = this.enterpriceDianResource.error;

    constructor() {
    if (this.isBrowser) {
      try {
        const userDataString = sessionStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          if (userData?.empresaId) {
            this.idEnterprice.set(userData.empresaId);
          }
        }
      } catch (e) {
        console.error('Error loading empresa DIAN:', e);
      }
    }
  }

}
