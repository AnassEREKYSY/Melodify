import { Component, Input, OnInit } from '@angular/core';
import { PlaylistService } from '../../core/services/playlist.service';
import { Song } from '../../core/models/Song.model';
import { Playlist } from '../../core/models/Playlist.model';
import { SongComponent } from "../song/song.component";
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SnackBarService } from '../../core/services/snack-bar.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-playlist-details',
  imports: [
    SongComponent,
     CommonModule,
     MatIconModule
    ],
  templateUrl: './playlist-details.component.html',
  styleUrl: './playlist-details.component.scss'
})
export class PlaylistDetailsComponent implements OnInit {
  playlistId!: string;
  songs:Song[]=[];
  playlist!: Playlist;

  constructor
  (
    private playlistService: PlaylistService,
    private snackBarService: SnackBarService,
    private route: ActivatedRoute
  ){}


  ngOnInit(): void {
    this.playlistId = this.route.snapshot.paramMap.get('id')!;
    if (this.playlistId) {
      this.getPlaylistDetails();
      this.getSongsForPlaylist();
    }
  }

  getPlaylistDetails(){
    this.playlistService.getOnePlaylist(this.playlistId)
      .subscribe({
        next: (response) => {
          this.playlist = response;
        },
        error: (error) => {
          console.error('Error fetching the playlist with the id: '+this.playlistId, error);
        }
      });
  }

  getSongsForPlaylist(){
    this.playlistService.getSongsFormPlaylist(this.playlistId)
      .subscribe({
        next: (response) => {
          this.songs = response;
        },
        error: (error) => {
          console.error('Error fetching Songs for the playlist with the id: '+this.playlistId, error);
        }
      });
  }

  onPlay(songId: string) {
  }

  onDelete(songId: string) {
    const songData = {
      playlistId: this.playlistId,
      songId: songId
    };
    this.playlistService.removeSongFromPlaylist(songData)
      .subscribe({
        next: (response) => {
          this.snackBarService.success(response)
          this.songs = this.songs.filter(song => song.id !== songId);
        },
        error: (error) => {
          console.error('Error removing song from playlist:', error);
        }
      });
  }

  onDeletePlaylist(arg0: string) {
    throw new Error('Method not implemented.');
  }

}
