import { HttpClient } from "@angular/common/http";
import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { rxResource } from "@angular/core/rxjs-interop";
import { environment } from "../../../environments/environment.local";
import { ApiResponse } from "@interfaces/Iresponse";
import { EnterpriceInvoiceResponse } from "@interfaces/invoice/invoice.interface";
import { map, catchError } from "rxjs/operators";
import { of } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class InvoiceDianInitializationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Signal para el ID de empresa
  private empresaDianId = signal<string | null>(null);

  // rxResource - carga cuando empresaDianId tiene valor
  private enterpriceDianResource = rxResource({
    params: () => this.empresaDianId(),
    stream: ({ params: idCompany }) => {
      if (!idCompany) return of(null);

      return this.http.get<ApiResponse<EnterpriceInvoiceResponse>>(
        `${this.apiUrl}/empresa-dian/${idCompany}`
      ).pipe(
        map(response => response.response),
        catchError(() => of(null))
      );
    }
  });

  // Signals públicos
  readonly enterpriceDianSignal = this.enterpriceDianResource.value;
  readonly isLoading = this.enterpriceDianResource.isLoading;
  readonly error = this.enterpriceDianResource.error;

  constructor() {
    // EAGER INITIALIZATION: Cargar inmediatamente al crear el servicio
    if (this.isBrowser) {
      try {
        const userDataString = sessionStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          if (userData?.idEmpresaDian) {
            this.empresaDianId.set(userData.idEmpresaDian); //  Dispara carga automática
          }
        }
      } catch (e) {
        console.error('Error loading empresa DIAN:', e);
      }
    }
  }

  // // Método para cambiar empresa manualmente
  // initialize(idCompany: string): void {
  //   this.empresaDianId.set(idCompany);
  // }

  // // Método para refrescar
  // refresh(): void {
  //   this.enterpriceDianResource.reload();
  // }
}
