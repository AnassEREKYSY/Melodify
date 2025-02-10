import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Song } from '../../core/models/Song.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-song',
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './song.component.html',
  styleUrl: './song.component.scss'
})
export class SongComponent {
  @Input() song: Song | undefined;
  @Output() playRequest = new EventEmitter<string>();
  @Output() deleteRequest = new EventEmitter<string>();

  playSong(id: string) {
    this.playRequest.emit(id);
  }

  deleteSong(id: string) {
    this.deleteRequest.emit(id);
  }

  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${(+seconds < 10 ? '0' : '')}${seconds}`;
  }
}
