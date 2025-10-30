import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.local';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICounter } from '@interfaces/Icounter';


@Injectable({
  providedIn: 'root'
})
export class CounterService {

  private readonly apiUrl = `${environment.apiUrl}`;
  protected readonly router= inject(Router)
  protected readonly http= inject(HttpClient)

  saveCounter(counter: ICounter): Observable<ICounter> {
    return this.http.post<ICounter>(`${this.apiUrl}/contador`, counter);
  }

}
