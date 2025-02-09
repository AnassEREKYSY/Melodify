import { Component, Input } from '@angular/core';
import { Playlist } from '../../../core/models/Playlist.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-playlist',
  imports: [CommonModule],
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.scss'
})
export class PlaylistComponent {
  @Input() playlist: Playlist | undefined;

  editPlaylist(){

  }

  deletePlaylist(){

  }
}
