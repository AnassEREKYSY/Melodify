import { Injectable } from '@angular/core';
import { environment } from '../../../environments/envirnoment.developement';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  login(): void {
    window.location.href = `${environment.apiUrl}spotify-auth/login`;
  }
}
