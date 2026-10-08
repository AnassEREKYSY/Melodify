import { Routes } from '@angular/router';
import { authGuard } from './core/http';

export const routes: Routes = [
  { path: 'login', title: 'Sign in · Melodify', loadComponent: () => import('./pages/login.page').then(m => m.LoginPage) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shell.component').then(m => m.ShellComponent),
    children: [
      { path: '', title: 'Melodify', loadComponent: () => import('./pages/home.page').then(m => m.HomePage) },
      { path: 'search', title: 'Search · Melodify', loadComponent: () => import('./pages/search.page').then(m => m.SearchPage) },
      { path: 'library', title: 'Library · Melodify', loadComponent: () => import('./pages/library.page').then(m => m.LibraryPage) },
      { path: 'liked', title: 'Liked songs · Melodify', loadComponent: () => import('./pages/liked.page').then(m => m.LikedPage) },
      { path: 'playlist/:id', loadComponent: () => import('./pages/playlist.page').then(m => m.PlaylistPage) },
      { path: 'artist/:id', loadComponent: () => import('./pages/artist.page').then(m => m.ArtistPage) },
      { path: 'album/:id', loadComponent: () => import('./pages/album.page').then(m => m.AlbumPage) },
      { path: 'stats', title: 'Your stats · Melodify', loadComponent: () => import('./pages/stats.page').then(m => m.StatsPage) },
      { path: 'releases', title: 'New releases · Melodify', loadComponent: () => import('./pages/releases.page').then(m => m.ReleasesPage) },
      // Old URLs
      { path: 'home', redirectTo: '' },
      { path: 'playlists', redirectTo: 'library' },
      { path: 'playlists/:id', redirectTo: 'playlist/:id' },
      { path: 'artists/:id', redirectTo: 'artist/:id' },
      { path: '**', title: 'Not found · Melodify', loadComponent: () => import('./pages/not-found.page').then(m => m.NotFoundPage) },
    ],
  },
];
