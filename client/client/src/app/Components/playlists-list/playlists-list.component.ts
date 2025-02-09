import { Component } from '@angular/core';
import { Playlist } from '../../core/models/Playlist.model';
import { PlaylistService } from '../../core/services/playlist.service';
import { SpotifyPaginatedPlaylists } from '../../core/models/SpotifyPaginatedPlaylists.model';
import { PlaylistComponent } from "./playlist/playlist.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-playlists-list',
  imports: [
    PlaylistComponent,
    CommonModule
  ],
  templateUrl: './playlists-list.component.html',
  styleUrl: './playlists-list.component.scss'
})
export class PlaylistsListComponent {
  playlists: Playlist[] = [];

  constructor(private playlistService: PlaylistService) {}

  ngOnInit(): void {
    this.fetchPlaylists();
  }

  fetchPlaylists(): void {

    this.playlistService.getSpotifyPlaylistsByUserId(0, 20)
      .subscribe({
        next: (response: SpotifyPaginatedPlaylists) => {
          this.playlists = response.playlists;
        },
        error: (error) => {
          console.error('Error fetching playlists:', error);
        }
      });
  }
}
