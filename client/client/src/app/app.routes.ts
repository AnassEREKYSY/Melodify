import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';
import { HomeComponent } from './Components/home/home.component';
import { UserProfilComponent } from './Components/user-profil/user-profil.component';
import { NavBarComponent } from './shared/nav-bar/nav-bar.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent },
    { path: 'profile', component: UserProfilComponent },
    { path: 'nav-bar', component: NavBarComponent },
];
