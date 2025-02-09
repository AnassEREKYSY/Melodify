import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Playlist } from '../../../core/models/Playlist.model';
import { CommonModule } from '@angular/common';
import { PlaylistService } from '../../../core/services/playlist.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';

@Component({
  selector: 'app-playlist',
  imports: [CommonModule],
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.scss'
})
export class PlaylistComponent implements OnInit {

  @Input() playlist: Playlist | undefined;
  @Output() deleteRequest = new EventEmitter<string>();

  constructor() {}

  ngOnInit(): void {
    console.log(this.playlist)
  }

  deletePlaylist(id : string) {
    this.deleteRequest.emit(id);
  }
}
