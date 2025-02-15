import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArtistComponent } from './artist.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { FollowedArtist } from '../../../core/models/FollowedArtist.model';

describe('ArtistComponent', () => {
  let component: ArtistComponent;
  let fixture: ComponentFixture<ArtistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatIconModule],
      declarations: [ArtistComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtistComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display artist name correctly', () => {
    const mockArtist: FollowedArtist = {
      id: '123',
      name: 'Taylor Swift',
      images: [{
        url: 'https://example.com/taylor.jpg',
        height: 0,
        width: 0
      }],
      type: '',
      genre: [],
      popularity: 0,
      followers: 0
    };

    component.artist = mockArtist;
    fixture.detectChanges();

    const nameElement = fixture.debugElement.query(By.css('.artist-name')).nativeElement;
    expect(nameElement.textContent).toContain('Taylor Swift');
  });

  it('should show a placeholder when no image is available', () => {
    const mockArtist: FollowedArtist = {
      id: '123',
      name: 'Unknown Artist',
      images: [],
      type: '',
      genre: [],
      popularity: 0,
      followers: 0
    };

    component.artist = mockArtist;
    fixture.detectChanges();

    const placeholderElement = fixture.debugElement.query(By.css('.artist-image.no-image'));
    expect(placeholderElement).toBeTruthy();
  });

  it('should emit unfollowRequest when the unfollow button is clicked', () => {
    spyOn(component.unfollowRequest, 'emit');

    const mockArtist: FollowedArtist = {
      id: '123',
      name: 'Artist Name',
      images: [{
        url: 'https://example.com/artist.jpg',
        height: 0,
        width: 0
      }],
      type: '',
      genre: [],
      popularity: 0,
      followers: 0
    };

    component.artist = mockArtist;
    fixture.detectChanges();

    const unfollowButton = fixture.debugElement.query(By.css('.unfollow-btn'));
    unfollowButton.triggerEventHandler('click', { stopPropagation: () => {} });

    expect(component.unfollowRequest.emit).toHaveBeenCalledWith('123');
  });

  it('should navigate to artist details when card is clicked', () => {
    const mockArtist: FollowedArtist = {
      id: '123',
      name: 'Artist Name',
      images: [{
        url: 'https://example.com/artist.jpg',
        height: 0,
        width: 0
      }],
      type: '',
      genre: [],
      popularity: 0,
      followers: 0
    };

    spyOn(component, 'goToArtistDetails');

    component.artist = mockArtist;
    fixture.detectChanges();

    const artistCard = fixture.debugElement.query(By.css('.artist-card'));
    artistCard.triggerEventHandler('click', null);

    expect(component.goToArtistDetails).toHaveBeenCalledWith('123');
  });
});
