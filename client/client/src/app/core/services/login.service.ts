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

  getLoginUrl(): Observable<string> {
    return this.http.get(`${this.apiUrl}spotify-auth/get-url-login`, { responseType: 'text' });
  }
  handleCallback(code: string, state: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}spotify-auth/callback?code=${code}&state=${state}`);
  }
}


