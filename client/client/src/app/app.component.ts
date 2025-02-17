import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavBarComponent } from "./shared/nav-bar/nav-bar.component";
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Melodify';
  showNavBar = true;

  constructor(private router: Router) {
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.showNavBar = this.router.url !== '/login' && this.router.url !== '/' && this.router.url !== '';
      console.log(this.router.url, this.showNavBar)
    })
  }
}
