import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { LoginService } from '../../core/services/login.service';
import { SnackBarService } from '../../core/services/snack-bar.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loginService: LoginService,
    private snackBarService: SnackBarService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  loginWithSpotify(): void {
    this.loginService.getLoginUrl().subscribe(response => {
      window.location.href = response.url;
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];

      if (code) {
        this.loginService.exchangeCode(code).subscribe({
          next: (response) => {
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('accessToken', response.userProfile.accessToken);
            }
            this.router.navigate(['/home']);
            this.snackBarService.success("You're logged successfully");
          },
          error: () => {
            this.snackBarService.error("Authentication failed");
          }
        });
      }
    });
  }
}
