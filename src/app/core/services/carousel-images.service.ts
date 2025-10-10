import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.local';


@Injectable({ providedIn: 'root' })
export class ConfigRolesService {

  protected apiUrl = environment.apiUrl
  protected readonly http = inject(HttpClient);

}

