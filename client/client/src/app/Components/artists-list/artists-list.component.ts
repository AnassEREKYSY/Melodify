import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FollowedArtistService } from '../../core/services/followed-artist.service';
import { FollowedArtist } from '../../core/models/FollowedArtist.model';
import { ArtistComponent } from "./artist/artist.component";
import { CommonModule } from '@angular/common';
import { SlickCarouselComponent, SlickCarouselModule } from 'ngx-slick-carousel';
import { MatIconModule } from '@angular/material/icon';


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

  slideConfig = {
    slidesToShow: 4,
    slidesToScroll: 1,
    infinite: true,
    autoplay: false, // Disable autoplay for testing
    autoplaySpeed: 3000,
    arrows: false,
    dots: false,
    rtl: true, 
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } }
    ]
  };

  constructor(
    private followedArtistService: FollowedArtistService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchFollowedArtists();
  }

  ngAfterViewInit(): void {
    // Use ChangeDetectorRef to ensure proper change detection
    setTimeout(() => {
      this.cdr.detectChanges(); // Manually trigger change detection
      if (this.slickModal) {
        console.log('Slick carousel initialized');
        this.slickModal.slickNext();
      }
    }, 500); // Delay to ensure the carousel instance is ready
  }

  fetchFollowedArtists(): void {
    this.followedArtistService.getFollowedArtist().subscribe({
      next: (artists: FollowedArtist[]) => {
        this.followedArtists = artists;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching followed artists:', error);
        this.isLoading = false;
      }
    });
  }

  prev() {
    if (this.slickModal) {
      this.slickModal.slickPrev();
    }
  }

  next() {
    if (this.slickModal) {
      this.slickModal.slickNext();
    }
  }
}

