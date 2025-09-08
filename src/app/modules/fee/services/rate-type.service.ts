import { HttpClient } from "@angular/common/http";
import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { environment } from "../../../environments/environment.local";


@Injectable({
  providedIn: 'root'
})
export class RateTypeService {

  readonly http = inject(HttpClient);
  readonly platformId = inject(PLATFORM_ID);
  readonly apiUrl = `${environment.apiUrl}`;





}
