import { Component, Input, OnInit, Output } from '@angular/core';
import { FollowedArtist } from '../../../core/models/FollowedArtist.model';
import { EventEmitter } from 'stream';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-artist',
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './artist.component.html',
  styleUrl: './artist.component.scss'
})
export class ArtistComponent implements OnInit {
  @Input() artist: FollowedArtist | undefined;  
  // @Output() unfollowRequest = new EventEmitter<string>(); 


  ngOnInit(): void {
  }

  unfollowArtist(id:string) {
    // if (this.artist) {
    //   this.unfollowRequest.emit(this.artist.id);  // Emit the artist ID to the parent
    // }
  }

  goToArtistDetails(arg0: any) {
    throw new Error('Method not implemented.');
  }

}
