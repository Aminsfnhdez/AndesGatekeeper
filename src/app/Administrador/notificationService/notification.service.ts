import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = 'https://api.proveedor-de-correo.com/send'; // Aún no tenemos proveedor

  constructor(private http: HttpClient) {}

  enviarNotificacion(email: string, mensaje: string, archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('to', email);
    formData.append('subject', 'Informe de Asistencias');
    formData.append('text', mensaje);
    formData.append('file', archivo);

    return this.http.post(this.apiUrl, formData);
  }
}
