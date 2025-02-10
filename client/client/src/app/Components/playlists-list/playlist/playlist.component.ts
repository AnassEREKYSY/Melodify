import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Playlist } from '../../../core/models/Playlist.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-playlist',
  imports: [CommonModule],
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.scss'
})
export class PlaylistComponent implements OnInit {

  @Input() playlist: Playlist | undefined;
  @Output() deleteRequest = new EventEmitter<string>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log(this.playlist)
  }

  deletePlaylist(id : string) {
    this.deleteRequest.emit(id);
  }

  goToDetails(id: string) {
    this.router.navigate(['/playlist', id]); 
  }
}
