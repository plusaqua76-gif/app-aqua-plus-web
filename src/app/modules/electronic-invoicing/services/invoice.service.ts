import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { DianInvoice, ProductDian, UnitCodes } from '@interfaces/invoice/dian-invoice';
import { ApiResponse } from '@interfaces/Iresponse';
import { IFacturaElectronica } from '@interfaces/invoice/Iinvoice-client';
import { IPaginatedResponse, IPaginationParams } from '@interfaces/IpaginatedResponse';
import { DocumentInvoiceDian, EnterpriceInvoice, EnterpriceInvoiceResponse, InvoiceDianData, ResolutionDian, ResponseResolutionDian, SetTestResponse } from '@interfaces/invoice/invoice.interface';
import { CreateAccount } from '../../accounting/pages/accounts/create-account';
import { CreditNoteRequest } from '@interfaces/invoice/credit-note';


@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  readonly http = inject(HttpClient);
  readonly platformId = inject(PLATFORM_ID);
  readonly apiUrl = `${environment.apiUrl}`;

  getEnterpriceDian(idCompany: string): Observable<ApiResponse<EnterpriceInvoiceResponse>> {
    return this.http.get<ApiResponse<EnterpriceInvoiceResponse>>(`${this.apiUrl}/empresa-dian/${idCompany}`);
  }

  creteCompany(company: EnterpriceInvoice): Observable<ApiResponse<EnterpriceInvoiceResponse>>{
    return this.http.post<ApiResponse<EnterpriceInvoiceResponse>>(`${this.apiUrl}/empresa-dian/dar-alta`, company);
  }

  sendTestDian(idCompany: string): Observable<ApiResponse<SetTestResponse>> {
    return this.http.post<ApiResponse<SetTestResponse>>(`${this.apiUrl}/empresa-dian/enviar-test/${idCompany}`, {});
  }

  getDataInvoiceDian(idInvoiceDian: number): Observable<ApiResponse<InvoiceDianData>> {
    return this.http.get<ApiResponse<InvoiceDianData>>(`${this.apiUrl}/factura-dian/data/${idInvoiceDian}`);
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


  creationCreditNoteDian(creditNoteRequest: CreditNoteRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/factura-dian/nota-credito`, creditNoteRequest);
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

  getCorrectionConceptCodesNC(): Observable<ApiResponse<UnitCodes[]>> {
    return this.http.get<ApiResponse<UnitCodes[]>>(`${this.apiUrl}/lista-dian`, {
      params: {
        endPoint: '/dian/correction-concept-codes-nc',
      },
    });
  }

  getDocumentInvoiceDian(idDian:number): Observable<ApiResponse<DocumentInvoiceDian>> {
    return this.http.get<ApiResponse<DocumentInvoiceDian>>(`${this.apiUrl}/factura-dian/factura-documento/${idDian}/PDF`);
  }

  resolutionInvoiceDian(resolution:ResolutionDian): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/empresa-dian/resolucion`, resolution);
  }

  getResolutionDian(empresaId:number): Observable<ApiResponse<ResponseResolutionDian>> {
    return this.http.get<ApiResponse<ResponseResolutionDian>>(`${this.apiUrl}/empresa-dian/resolucion/${empresaId}`);
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

    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }

    if (params.filters) {
      httpParams = this.mapFiltersToHttpParams(httpParams, params.filters);
    }

    return this.http.get<IPaginatedResponse<IFacturaElectronica>>(url, { params: httpParams });
  }

  private mapFiltersToHttpParams(
    httpParams: HttpParams,
    filters: Record<string, string>
  ): HttpParams {
    Object.entries(filters).forEach(([key, value]) => {
      if (value?.trim()) {
        const trimmedValue = value.trim();
        httpParams = this.applyFilter(httpParams, key, trimmedValue);
      }
    });
    return httpParams;
  }

  private applyFilter(
    httpParams: HttpParams,
    key: string,
    value: string
  ): HttpParams {
    switch (key) {
      case 'factura.codigo':
        return httpParams.set('codigoFactura', value);
      case 'cliente.nombre':
        return httpParams.set('nombreCompleto', value);
      case 'cliente.numeroCedula':
        return httpParams.set('numeroCedula', value);
      case 'fechaCreacion':
        return httpParams.set('fechaEmision', value);
      case 'factura.consumo':
        return httpParams.set('consumo', value);
      case 'factura.precio':
        return httpParams.set('precio', this.normalizeCurrencyValue(value));
      case 'estadoLegal':
        return httpParams.set('estadoLegal', value);
      case 'numero':
        return httpParams.set('numero', value);
      default:
        // Si no hay mapeo específico, usar el mismo nombre
        return httpParams.set(key, value);
    }
  }

  private normalizeCurrencyValue(value: string): string {
    return value
      .replace(/\$/g, '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(/,/g, '.');          
  }

}
