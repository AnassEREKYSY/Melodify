import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FollowedArtistService } from '../../core/services/followed-artist.service';
import { FollowedArtist } from '../../core/models/FollowedArtist.model';
import { ArtistComponent } from "./artist/artist.component";
import { CommonModule } from '@angular/common';
import { SlickCarouselComponent, SlickCarouselModule } from 'ngx-slick-carousel';
import { MatIconModule } from '@angular/material/icon';
import { SnackBarService } from '../../core/services/snack-bar.service';


@Component({
  selector: 'app-artists-list',
  templateUrl: './artists-list.component.html',
  styleUrls: ['./artists-list.component.scss'],
  imports: [
    ArtistComponent,
    CommonModule,
    SlickCarouselModule,
    MatIconModule
  ]
})
export class ArtistsListComponent implements OnInit, AfterViewInit {
  @ViewChild('slickModal') slickModal!: SlickCarouselComponent; 
  followedArtists: FollowedArtist[] = [];
  isLoading: boolean = true;

  isSlickInitialized = false;

  ngAfterViewInit() {
    console.log('ngAfterViewInit: Checking Slick Initialization...');
  }

  ngAfterViewChecked() {
    if (!this.isSlickInitialized && this.slickModal && this.slickModal.$instance) {
      this.isSlickInitialized = true;
      console.log('✅ Slick is initialized:', this.slickModal);
    }
  }

  prev() {
    if (this.isSlickInitialized) {
      this.slickModal.slickPrev();
    } else {
      console.warn('❌ Slick instance not ready yet');
    }
  }

  next() {
    if (this.isSlickInitialized) {
      this.slickModal.slickNext();
    } else {
      console.warn('❌ Slick instance not ready yet');
    }
  }

  slideConfig = {
    slidesToShow: 4,
    slidesToScroll: 1,
    infinite: true,
    dots: false,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  constructor(
    private followedArtistService: FollowedArtistService,
    private snackBarService: SnackBarService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchFollowedArtists();
  }

  

  fetchFollowedArtists(): void {
    this.followedArtistService.getFollowedArtist().subscribe({
      next: (artists: FollowedArtist[]) => {
        this.followedArtists = artists;
        this.isLoading = false;
  
        setTimeout(() => {
          if (this.slickModal && this.slickModal.$instance) {
            console.log('Slick carousel is ready, resetting index');
            this.slickModal.slickGoTo(0);
          } else {
            console.warn('Slick carousel instance is still not ready');
          }
        }, 500);
      },
      error: (error) => {
        console.error('Error fetching followed artists:', error);
        this.isLoading = false;
      }
    });
  }

  UnfollowArtist(id: string) {
    this.followedArtistService.unfollowArtist(id).subscribe({
      next: () => {
        this.snackBarService.success("Artist Unfollowed successfully");
        this.followedArtists = this.followedArtists.filter(artist => artist.id !== id);
      },
      error: (error) => {
        console.error('Error Unfollowing artist:', error);
        this.snackBarService.error('Error Unfollowing artist: ' + error);
      }
    });
  }
    

  
}

