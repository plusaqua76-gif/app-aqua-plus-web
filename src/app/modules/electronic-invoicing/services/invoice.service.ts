import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment.local';
import { Observable } from 'rxjs';
import { DianInvoice, ProductDian, UnitCodes } from '@interfaces/invoice/dian-invoice';
import { ApiResponse } from '@interfaces/Iresponse';
import { IFacturaElectronica } from '@interfaces/invoice/Iinvoice-client';
import { IPaginatedResponse, IPaginationParams } from '@interfaces/IpaginatedResponse';
import { EnterpriceInvoice, EnterpriceInvoiceResponse, SetTestResponse } from '@interfaces/invoice/invoice.interface';

export interface DocumentInvoiceDian {
  file: {content:string}
}


@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  readonly http = inject(HttpClient);
  readonly platformId = inject(PLATFORM_ID);
  readonly apiUrl = `${environment.apiUrl}`;

  creteCompany(company: EnterpriceInvoice): Observable<ApiResponse<EnterpriceInvoiceResponse>>{
    return this.http.post<ApiResponse<EnterpriceInvoiceResponse>>(`${this.apiUrl}/empresa-dian/dar-alta`, company);
  }

  sendTestDian(idCompany: number): Observable<ApiResponse<SetTestResponse>> {
    return this.http.post<ApiResponse<SetTestResponse>>(`${this.apiUrl}/empresa-dian/enviar-test/${idCompany}`, {});
  }


  SendInvoiceDianClient(invoice: DianInvoice): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/factura-dian/factura`, invoice);
  }

  getUnitCodes(): Observable<ApiResponse<UnitCodes[]>> {
    return this.http.get<ApiResponse<UnitCodes[]>>(`${this.apiUrl}/lista-dian`, {
      params: {
        endPoint: '/dian/unit-codes',
      },
    });
  }

  getProductCodesDian(codeDian: string): Observable<ApiResponse<ProductDian[]>> {
    return this.http.get<ApiResponse<ProductDian[]>>(`${this.apiUrl}/producto-dian`, {
      params: {
        term: codeDian,
      },
    });
  }


  createProductDian(product: ProductDian): Observable<ApiResponse<ProductDian>> {
    return this.http.post<ApiResponse<ProductDian>>(`${this.apiUrl}/producto-dian`, product);
  }

  getPaymentMethodsDian(): Observable<ApiResponse<UnitCodes[]>> {
    return this.http.get<ApiResponse<UnitCodes[]>>(`${this.apiUrl}/lista-dian`, {
      params: {
        endPoint: '/dian/payment-methods',
      },
    });
  }

  getDocumentInvoiceDian(idDian:number): Observable<ApiResponse<DocumentInvoiceDian>> {
    return this.http.get<ApiResponse<DocumentInvoiceDian>>(`${this.apiUrl}/factura-dian/factura-documento/${idDian}/PDF`);
  }


  getClientInvoicesPaginated(
    empresaId: number,
    params: IPaginationParams
  ): Observable<IPaginatedResponse<IFacturaElectronica>> {
    const url = `${this.apiUrl}/factura-dian/factura/${empresaId}`;

    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('size', params.size.toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value?.trim()) {
          httpParams = httpParams.set(key, value.trim());
        }
      });
    }

    return this.http.get<IPaginatedResponse<IFacturaElectronica>>(url, { params: httpParams });
  }


}
