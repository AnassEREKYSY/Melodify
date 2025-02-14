import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArtistService } from '../../core/services/artist.service';
import { Song } from '../../core/models/Song.model';
import { Artist } from '../../core/models/Artist.model';
import { SongComponent } from "../song/song.component";
import { CommonModule } from '@angular/common';
import { FollowedArtistService } from '../../core/services/followed-artist.service';

@Component({
  selector: 'app-artist-details',
  standalone: true,
  imports: [SongComponent, CommonModule],
  templateUrl: './artist-details.component.html',
  styleUrl: './artist-details.component.scss'
})
export class ArtistDetailsComponent implements OnInit {
  artistId!: string;
  shouldShowDeleteButton: boolean = false; 
  songs: Song[] = [];
  artist!: Artist;
  isFollowing: boolean = false;

  constructor(
    private artistService: ArtistService,
    private followedArtistService: FollowedArtistService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.artistId = this.route.snapshot.paramMap.get('id')!;
    if (this.artistId) {
      this.getArtistDetails();
      this.getArtistSongs();
      this.checkIfFollowing();
    }
  }

  getArtistDetails() {
    this.artistService.getArtistById(this.artistId)
      .subscribe({
        next: (response) => {
          this.artist = response;
        },
        error: (error) => {
          console.error('Error fetching artist with id: ' + this.artistId, error);
        }
      });
  }

  getArtistSongs() {
    this.artistService.getArtistTopSongs(this.artistId)
      .subscribe({
        next: (response) => {
          this.songs = response;
          console.log(this.songs)
        },
        error: (error) => {
          console.error('Error fetching songs for artist with id: ' + this.artistId, error);
        }
      });
  }

  followArtist() {
    this.followedArtistService.followArtist(this.artistId)
      .subscribe({
        next: () => {
          this.isFollowing = true;
          console.log('Followed artist:', this.artistId);
        },
        error: (error) => {
          console.error('Error following artist:', error);
        }
      });
  }

  unfollowArtist() {
    this.followedArtistService.unfollowArtist(this.artistId)
      .subscribe({
        next: () => {
          this.isFollowing = false;
          console.log('Unfollowed artist:', this.artistId);
        },
        error: (error) => {
          console.error('Error unfollowing artist:', error);
        }
      });
  }

  checkIfFollowing() {
    this.followedArtistService.getFollowedArtist()
      .subscribe({
        next: (followedArtists) => {
          this.isFollowing = followedArtists.some(artist => artist.id === this.artistId);
        },
        error: (error) => {
          console.error('Error checking if following artist:', error);
        }
      });
  }

  toggleFollow() {
    if (this.isFollowing) {
      this.unfollowArtist();
    } else {
      this.followArtist();
    }
  }


  onPlay(songId: string) {
    console.log('Playing song with id:', songId);
  }

  formatFollowers(count: number): string {
    if (count >= 1_000_000) {
      return (count / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (count >= 1_000) {
      return (count / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return count.toString();
  }
  
}
