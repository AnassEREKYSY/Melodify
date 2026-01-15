import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/envirnoment.developement';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getLoginUrl(): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(
      `${this.apiUrl}spotify-auth/get-url-login`
    );
  }

  exchangeCode(code: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}spotify-auth/exchange?code=${code}`
    );
  }
}
