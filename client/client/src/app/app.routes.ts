import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';
import { HomeComponent } from './Components/home/home.component';
import { UserProfilComponent } from './Components/user-profil/user-profil.component';
import { NavBarComponent } from './shared/nav-bar/nav-bar.component';
import { PlaylistDetailsComponent } from './Components/playlist-details/playlist-details.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent , canActivate: [AuthGuard]},
    { path: 'profile', component: UserProfilComponent, canActivate: [AuthGuard] },
    { path: 'nav-bar', component: NavBarComponent , canActivate: [AuthGuard]},
    { path: 'playlist/:id', component: PlaylistDetailsComponent, canActivate: [AuthGuard] },
];
