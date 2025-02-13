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


@Component({
  selector: 'app-song-details',
  imports: [
    CommonModule,
    MatSliderModule,
    FormsModule,
    MatIconModule
  ],
  templateUrl: './song-details.component.html',
  styleUrl: './song-details.component.scss'
})
export class SongDetailsComponent implements OnInit {
  songId!: string;
  song!: Song;
  isFollowing: boolean = false;
  currentTime: number = 0;

  constructor(
    private songService: SongService,
    private followedArtistService: FollowedArtistService,
    private snackBarService:SnackBarService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.songId = this.route.snapshot.paramMap.get('id')!;
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
    console.log("AAAAAAAAAAAA", this.song)
    if (artistId) {
      if (this.isFollowing) {
        this.followedArtistService.unfollowArtist(artistId).subscribe({
          next: () => {
            this.isFollowing = false;
            this.snackBarService.success('Unfollowed artist successfully')
          },
          error: (error) => {
            console.error('Error unfollowing artist:', error);
          }
        });
      } else {
        this.followedArtistService.followArtist(artistId).subscribe({
          next: () => {
            this.isFollowing = true;
            this.snackBarService.success('Followed artist successfully')
          },
          error: (error) => {
            console.error('Error following artist:', error);
          }
        });
      }
    }
  }  

  playSong(){}

  formatTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (parseInt(seconds) < 10 ? '0' : '') + seconds;
  }
}
