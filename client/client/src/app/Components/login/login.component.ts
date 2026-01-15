import { Component } from '@angular/core';
import { LoginService } from '../../core/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  constructor(private loginService: LoginService) {}

  loginWithSpotify(): void {
    this.loginService.login();
  }
}
