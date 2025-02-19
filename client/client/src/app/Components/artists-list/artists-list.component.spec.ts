import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArtistsListComponent } from './artists-list.component';
import { FollowedArtistService } from '../../core/services/followed-artist.service';
import { SnackBarService } from '../../core/services/snack-bar.service';
import { of } from 'rxjs';
import { FollowedArtist } from '../../core/models/FollowedArtist.model';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { By } from '@angular/platform-browser';
import { ArtistComponent } from './artist/artist.component';

describe('ArtistsListComponent', () => {
  let component: ArtistsListComponent;
  let fixture: ComponentFixture<ArtistsListComponent>;
  let followedArtistService: jasmine.SpyObj<FollowedArtistService>;
  let snackBarService: jasmine.SpyObj<SnackBarService>;

  const mockArtists: FollowedArtist[] = [
    {
      id: '1',
      name: 'Artist One',
      images: [{ url: 'https://example.com/artist1.jpg', height: 0, width: 0 }],
      type: '',
      genre: [],
      popularity: 0,
      followers: 0
    },
    {
      id: '2',
      name: 'Artist Two',
      images: [{ url: 'https://example.com/artist2.jpg', height: 0, width: 0 }],
      type: '',
      genre: [],
      popularity: 0,
      followers: 0
    }
  ];

  beforeEach(async () => {
    followedArtistService = jasmine.createSpyObj('FollowedArtistService', ['getFollowedArtist', 'unfollowArtist']);
    snackBarService = jasmine.createSpyObj('SnackBarService', ['success', 'error']);
  
    await TestBed.configureTestingModule({
      imports: [CommonModule, MatIconModule, SlickCarouselModule,ArtistsListComponent, ArtistComponent],
      providers: [
        { provide: FollowedArtistService, useValue: followedArtistService },
        { provide: SnackBarService, useValue: snackBarService }
      ]
    }).compileComponents();
  
    fixture = TestBed.createComponent(ArtistsListComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display followed artists when data is successfully fetched', () => {
    followedArtistService.getFollowedArtist.and.returnValue(of(mockArtists));
    component.fetchFollowedArtists();
    fixture.detectChanges();  
    const artistCards = fixture.debugElement.queryAll(By.css('.artist-card'));
    const artistText = artistCards.map(card => card.nativeElement.textContent.trim()).join(' ');
    expect(artistText).toContain('Artist One');
    expect(artistText).toContain('Artist Two');
  });
  
});
