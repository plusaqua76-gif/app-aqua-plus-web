import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private apiUrl = 'http://localhost:9000/api';

  constructor(private http: HttpClient) { }

  // Guardar token de suscripción
  saveToken(subscription: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/save-token`, subscription);
  }

  // Obtener clave pública VAPID
  getVapidPublicKey(): Observable<any> {
    return this.http.get(`${this.apiUrl}/vapid-public-key`);
  }

  // Obtener todos los tokens (para admin)
  getTokens(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tokens`);
  }

  // Enviar notificación a todos
  sendNotificationToAll(notification: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar`, notification);
  }

  // Enviar notificación específica
  sendNotificationToSubscription(subscriptionId: number, notification: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar/${subscriptionId}`, notification);
  }
}
