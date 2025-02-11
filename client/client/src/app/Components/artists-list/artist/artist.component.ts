import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FollowedArtist } from '../../../core/models/FollowedArtist.model';
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
  @Output() unfollowRequest:EventEmitter<string> = new EventEmitter<string>();
  


  ngOnInit(): void {
    console.log(this.artist?.id,this.artist?.name)
  }

  unfollowArtist(id:string) {
    this.unfollowRequest.emit(id);
  }

  goToArtistDetails(arg0: any) {
  }

}
