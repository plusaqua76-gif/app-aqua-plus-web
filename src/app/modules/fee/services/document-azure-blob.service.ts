import { HttpClient } from "@angular/common/http";
import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { environment } from "../../../environments/environment.local";
import { Observable } from "rxjs";
import { DocumentUpload, DocumentUploadResponse } from "@interfaces/document-azure-blob/document";
import { InvoiceTemplate, InvoiceTemplateResponse, InvoiceTemplateApiResponse } from "@interfaces/bill/Iinvoice-template";


@Injectable({
  providedIn: 'root'
})
export class  DocumentAzureBlobService {

  readonly http = inject(HttpClient);
  readonly apiUrl = `${environment.apiUrl}`;

  documentIploadUrl(document: DocumentUpload): Observable<DocumentUploadResponse> {
    return this.http.post<DocumentUploadResponse>(`${this.apiUrl}/documento/upload`, document);
  }

  createInvoiceTemplate(invoice:InvoiceTemplate): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/plantilla`, invoice);
  }

  getInvoiceTemplateByEnterprise(enterpriceId:number): Observable<InvoiceTemplateApiResponse> {
    return this.http.get<InvoiceTemplateApiResponse>(`${this.apiUrl}/plantilla/empresa/${enterpriceId}`);
  }

}
