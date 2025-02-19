import { Component, Inject, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { LoginService } from '../../core/services/login.service';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { SnackBarService } from '../../core/services/snack-bar.service';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent  implements OnInit {
  constructor(    
    private route: ActivatedRoute,
    private router: Router, 
    private loginService: LoginService,
    private snackBarService: SnackBarService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  loginWithSpotify(): void {
    this.loginService.getLoginUrl().subscribe((authUrl) => {
      window.location.href = authUrl;
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const state = params['state'];
      if (code && state) {
        this.handleSpotifyCallback(code, state);
      }
    });
  }

  private handleSpotifyCallback(code: string, state: string): void {
    this.loginService.handleCallback(code, state).subscribe(
      response => {
        const user = response.userProfile;
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('accessToken', user.accessToken);
        }
        this.router.navigate(['/home']);
        this.snackBarService.success("You're logged successfully");
      },
      error => {
        this.snackBarService.success('Authentication failed'+error);
      }
    );    
  }

}
