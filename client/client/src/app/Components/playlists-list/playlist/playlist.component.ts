import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Playlist } from '../../../core/models/Playlist.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-playlist',
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.scss'
})
export class PlaylistComponent implements OnInit {

  @Input() playlist: Playlist | undefined;
  @Output() deleteRequest = new EventEmitter<string>();

  constructor(private router: Router) {}

  ngOnInit(): void {}

  deletePlaylist(id : string) {
    this.deleteRequest.emit(id);
  }

  goToDetails(id: string) {
    this.router.navigate(['/playlist', id]); 
  }
}
