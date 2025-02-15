import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArtistsListComponent } from './artists-list.component';
import { FollowedArtistService } from '../../core/services/followed-artist.service';
import { SnackBarService } from '../../core/services/snack-bar.service';
import { of, throwError } from 'rxjs';
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
      id: '1', name: 'Artist One', images: [{
        url: 'https://example.com/artist1.jpg',
        height: 0,
        width: 0
      }],
      type: '',
      genre: [],
      popularity: 0,
      followers: 0
    },
    {
      id: '2', name: 'Artist Two', images: [{
        url: 'https://example.com/artist2.jpg',
        height: 0,
        width: 0
      }],
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
      imports: [CommonModule, MatIconModule, SlickCarouselModule],
      declarations: [ArtistsListComponent, ArtistComponent],
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

  it('should fetch followed artists on init', () => {
    followedArtistService.getFollowedArtist.and.returnValue(of(mockArtists));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.followedArtists.length).toBe(2);
    expect(followedArtistService.getFollowedArtist).toHaveBeenCalled();
  });

  it('should handle errors when fetching followed artists', () => {
    followedArtistService.getFollowedArtist.and.returnValue(throwError(() => new Error('API Error')));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.followedArtists.length).toBe(0);
    expect(component.isLoading).toBeFalse();
    expect(followedArtistService.getFollowedArtist).toHaveBeenCalled();
  });

  it('should call unfollowArtist and update the list', () => {
    followedArtistService.getFollowedArtist.and.returnValue(of(mockArtists));
    followedArtistService.unfollowArtist.and.returnValue(of({}));

    component.ngOnInit();
    fixture.detectChanges();

    component.UnfollowArtist('1');
    fixture.detectChanges();

    expect(followedArtistService.unfollowArtist).toHaveBeenCalledWith('1');
    expect(component.followedArtists.length).toBe(1);
    expect(component.followedArtists[0].id).toBe('2');
    expect(snackBarService.success).toHaveBeenCalledWith('Artist Unfollowed successfully');
  });

  it('should handle errors when unfollowing an artist', () => {
    followedArtistService.unfollowArtist.and.returnValue(throwError(() => new Error('API Error')));

    component.UnfollowArtist('1');
    fixture.detectChanges();

    expect(followedArtistService.unfollowArtist).toHaveBeenCalledWith('1');
    expect(snackBarService.error).toHaveBeenCalledWith('Error Unfollowing artist: API Error');
  });

  it('should render the correct number of artist components', () => {
    followedArtistService.getFollowedArtist.and.returnValue(of(mockArtists));

    component.ngOnInit();
    fixture.detectChanges();

    const artistComponents = fixture.debugElement.queryAll(By.css('app-artist'));
    expect(artistComponents.length).toBe(2);
  });
});
