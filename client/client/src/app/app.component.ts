import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavBarComponent } from "./shared/nav-bar/nav-bar.component";

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
    this.router.events.subscribe(() => {
      this.showNavBar = this.router.url !== '/login';
    });
  }
}
