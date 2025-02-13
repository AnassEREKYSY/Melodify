import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';
import { HomeComponent } from './Components/home/home.component';
import { UserProfilComponent } from './Components/user-profil/user-profil.component';
import { NavBarComponent } from './shared/nav-bar/nav-bar.component';
import { PlaylistDetailsComponent } from './Components/playlist-details/playlist-details.component';
import { AuthGuard } from './guards/auth.guard';
import { ArtistDetailsComponent } from './Components/artist-details/artist-details.component';
import { SongDetailsComponent } from './Components/song-details/song-details.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent , canActivate: [AuthGuard]},
    { path: 'profile', component: UserProfilComponent, canActivate: [AuthGuard] },
    { path: 'nav-bar', component: NavBarComponent , canActivate: [AuthGuard]},
    { path: 'playlist/:id', component: PlaylistDetailsComponent, canActivate: [AuthGuard] },
    { path: 'artist/:id', component: ArtistDetailsComponent, canActivate: [AuthGuard] },
    { path: 'song/:id', component: SongDetailsComponent, canActivate: [AuthGuard] },


];
