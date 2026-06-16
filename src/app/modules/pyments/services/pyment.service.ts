import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment.test";
import { Observable } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { RequestStartPyment } from "@interfaces/pyment/request-start-pyment";
import { RequestTransaccion } from "@interfaces/pyment/request-transaccion";
import { ResponseTransaccion } from "@interfaces/pyment/response-transaccion";
import { PymentResponse } from "@interfaces/pyment/start-pyment-response";
import { PseBanco } from "@interfaces/pyment/pse-banco";
import { PollTransaccion } from "@interfaces/pyment/poll-transaccion";
import { RedirectResponse } from "@interfaces/pyment/redirect-response";
import { MerchantResponse } from "@interfaces/pyment/merchant-response";
import { RequestTokenizarTarjeta } from "@interfaces/pyment/request-tokenizar-tarjeta";

interface WompiCardTokenResponse {
  status: string;
  data: {
    id: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PymentService {

  private readonly http = inject(HttpClient);
  readonly apiUrl = `${environment.apiUrl}`;

  private getWompiApiBaseUrl(publicKey: string): string {
    return publicKey.startsWith('pub_test_')
      ? 'https://sandbox.wompi.co/v1'
      : 'https://production.wompi.co/v1';
  }

  private readonly skipLoader: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'X-Skip-Loader': 'true' })
  };

  startPyment(request: RequestStartPyment): Observable<ApiResponse<PymentResponse>> {
    return this.http.post<ApiResponse<PymentResponse>>(
      `${this.apiUrl}/pagos/iniciar`,
      request,
      { headers: new HttpHeaders({ 'X-Skip-Loader': 'true', 'X-Secured': 'true' }) }
    );
  }

  tokenizarTarjeta(request: RequestTokenizarTarjeta, publicKey: string): Observable<WompiCardTokenResponse> {
    const wompiRequest = {
      number: request.numero,
      cvc: request.cvc,
      exp_month: request.mesExpiracion,
      exp_year: request.anioExpiracion,
      card_holder: request.nombreTitular,
    };

    return this.http.post<WompiCardTokenResponse>(
      `${this.getWompiApiBaseUrl(publicKey)}/tokens/cards`,
      wompiRequest,
      {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${publicKey}`,
          'Content-Type': 'application/json',
          'X-Skip-Loader': 'true',
        }),
      }
    );
  }


  transaccion(request: RequestTransaccion, deviceId: string, sessionId: string): Observable<ApiResponse<ResponseTransaccion>> {
    return this.http.post<ApiResponse<ResponseTransaccion>>(
      `${this.apiUrl}/pagos/transaccion`,
      request,
      {
        headers: new HttpHeaders({
          'X-Skip-Loader': 'true',
          'X-Secured':     'true',
          'X-Device-Id':   deviceId,
          'X-Session-Id':  sessionId,
        })
      }
    );
  }

  getBancosPSE(): Observable<ApiResponse<PseBanco[]>> {
    return this.http.get<ApiResponse<PseBanco[]>>(`${this.apiUrl}/pagos/pse/bancos`, this.skipLoader);
  }

  pollTransaccion(referencia: string): Observable<ApiResponse<PollTransaccion>> {
    return this.http.get<ApiResponse<PollTransaccion>>(`${this.apiUrl}/pagos/${referencia}`, this.skipLoader);
  }

  redirectPyment(referencia: string, deviceId: string, sessionId: string): Observable<ApiResponse<RedirectResponse>> {
    return this.http.post<ApiResponse<RedirectResponse>>(
      `${this.apiUrl}/pagos/redirigir/${referencia}`,
      {},
      {
        headers: new HttpHeaders({
          'X-Skip-Loader': 'true',
          'X-Secured':     'true',
          'X-Device-Id':   deviceId,
          'X-Session-Id':  sessionId,
        })
      }
    );
  }

  getMerchant(): Observable<ApiResponse<MerchantResponse>> {
    return this.http.get<ApiResponse<MerchantResponse>>(`${this.apiUrl}/pagos/merchant`, this.skipLoader);
  }
}
