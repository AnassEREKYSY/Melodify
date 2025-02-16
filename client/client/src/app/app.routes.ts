import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./Components/login/login.component').then(m => m.LoginComponent) },
    { path: '/', loadComponent: () => import('./Components/login/login.component').then(m => m.LoginComponent) },
    { path: 'login', loadComponent: () => import('./Components/login/login.component').then(m => m.LoginComponent) },
    { path: 'home', loadComponent: () => import('./Components/home/home.component').then(m => m.HomeComponent), canActivate: [AuthGuard] },
    { path: 'profile', loadComponent: () => import('./Components/user-profil/user-profil.component').then(m => m.UserProfilComponent), canActivate: [AuthGuard] },
    { path: 'nav-bar', loadComponent: () => import('./shared/nav-bar/nav-bar.component').then(m => m.NavBarComponent), canActivate: [AuthGuard] },
    { path: 'playlist/:id', loadComponent: () => import('./Components/playlist-details/playlist-details.component').then(m => m.PlaylistDetailsComponent), canActivate: [AuthGuard] },
    { path: 'artist/:id', loadComponent: () => import('./Components/artist-details/artist-details.component').then(m => m.ArtistDetailsComponent), canActivate: [AuthGuard] },
    { path: 'song/:id', loadComponent: () => import('./Components/song-details/song-details.component').then(m => m.SongDetailsComponent), canActivate: [AuthGuard] },
];
