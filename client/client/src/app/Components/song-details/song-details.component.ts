import { Component, OnInit } from '@angular/core';
import { Song } from '../../core/models/Song.model';
import { SongService } from '../../core/services/song.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FollowedArtistService } from '../../core/services/followed-artist.service';
import { SnackBarService } from '../../core/services/snack-bar.service';
import { Playlist } from '../../core/models/Playlist.model';
import { PlaylistService } from '../../core/services/playlist.service';
import { SpotifyPaginatedPlaylists } from '../../core/models/SpotifyPaginatedPlaylists.model';


@Component({
  selector: 'app-song-details',
  imports: [
    CommonModule,
    MatSliderModule,
    FormsModule,
    MatIconModule,
],
  templateUrl: './song-details.component.html',
  styleUrl: './song-details.component.scss'
})
export class SongDetailsComponent implements OnInit {
  songId!: string;
  song!: Song;
  isFollowing: boolean = false;
  currentTime: number = 0;
  playlists: Playlist[] = [];
  isPlaylistsVisible: boolean = false; 

  constructor(
    private songService: SongService,
    private followedArtistService: FollowedArtistService,
    private playlistService: PlaylistService,
    private snackBarService: SnackBarService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.songId = this.route.snapshot.paramMap.get('id')!;
    this.playlistService.getSpotifyPlaylistsByUserId().subscribe({
      next: (response: SpotifyPaginatedPlaylists) => {
        this.playlists = [...this.playlists, ...response.playlists];
        console.log(this.playlists)
      },
      error: (error) => {
        console.error('Error fetching playlists:', error);
      }
    });
    if (this.songId) {
      this.getSongDetails();
    }
  }

  getSongDetails() {
    this.songService.getOneSong(this.songId).subscribe({
      next: (response) => {
        this.song = response;
        this.checkIfFollowing();
      },
      error: (error) => {
        console.error('Error fetching song with id: ' + this.songId, error);
      }
    });
  }

  checkIfFollowing() {
    const artistId = this.song.artists[0]?.id;
    if (artistId) {
      this.followedArtistService.getFollowedArtist().subscribe({
        next: (followedArtists) => {
          this.isFollowing = followedArtists.some(artist => artist.id === artistId);
        },
        error: (error) => {
          console.error('Error checking if following artist:', error);
        }
      });
    }
  }

  toggleFollow() {
    const artistId = this.song.artists[0]?.id;
    if (artistId) {
      if (this.isFollowing) {
        this.followedArtistService.unfollowArtist(artistId).subscribe({
          next: () => {
            this.isFollowing = false;
            this.snackBarService.success('Unfollowed artist successfully');
          },
          error: (error) => {
            console.error('Error unfollowing artist:', error);
          }
        });
      } else {
        this.followedArtistService.followArtist(artistId).subscribe({
          next: () => {
            this.isFollowing = true;
            this.snackBarService.success('Followed artist successfully');
          },
          error: (error) => {
            console.error('Error following artist:', error);
          }
        });
      }
    }
  }

  togglePlaylists() {
    this.isPlaylistsVisible = !this.isPlaylistsVisible;
  }

  addToPlaylist(playlist: Playlist) {
    const songData = {
      playlistId: playlist.id,
      songId: this.songId
    };
    this.playlistService.addSongToPlaylist(songData).subscribe({
      next: (response) => {
        this.snackBarService.success(response);
      },
      error: (error) => {
        console.error('Error following artist:', error);
      }
    });
  }

  playSong() {}

  formatTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (parseInt(seconds) < 10 ? '0' : '') + seconds;
  }
}


