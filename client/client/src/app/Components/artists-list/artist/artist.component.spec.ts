import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArtistComponent } from './artist.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { FollowedArtist } from '../../../core/models/FollowedArtist.model';
import { DebugElement } from '@angular/core';
import { Router } from '@angular/router';

describe('ArtistComponent', () => {
  let component: ArtistComponent;
  let fixture: ComponentFixture<ArtistComponent>;
  let router: Router;

  const mockArtist: FollowedArtist = {
    id: '1',
    name: 'Artist One',
    images: [{ url: 'https://example.com/artist1.jpg', height: 100, width: 100 }],
    type: 'music',
    genre: ['Pop'],
    popularity: 80,
    followers: 1000
  };

  const mockArtistWithoutImage: FollowedArtist = {
    id: '2',
    name: 'Artist Two',
    images: [],
    type: 'music',
    genre: ['Rock'],
    popularity: 90,
    followers: 2000
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatIconModule, ArtistComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtistComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the artist image when available', () => {
    component.artist = mockArtist;
    fixture.detectChanges();
    
    const artistImage: DebugElement = fixture.debugElement.query(By.css('.artist-image'));
    expect(artistImage).toBeTruthy();
    expect(artistImage.nativeElement.src).toBe('https://example.com/artist1.jpg');
  });

  it('should display the no-image placeholder when no image is available', () => {
    component.artist = mockArtistWithoutImage;
    fixture.detectChanges();
    
    const noImageDiv: DebugElement = fixture.debugElement.query(By.css('.artist-image.no-image'));
    expect(noImageDiv).toBeTruthy();
  });

  it('should emit unfollowRequest event when unfollow button is clicked', () => {
    component.artist = mockArtist;
    fixture.detectChanges();
    
    spyOn(component.unfollowRequest, 'emit');
    const unfollowButton = fixture.debugElement.query(By.css('.unfollow-btn'));
    unfollowButton.triggerEventHandler('click', { stopPropagation: () => {} });

    expect(component.unfollowRequest.emit).toHaveBeenCalledWith('1');
  });

  it('should navigate to artist details page when the artist card is clicked', () => {
    component.artist = mockArtist;
    fixture.detectChanges();
    
    spyOn(router, 'navigate');
    const artistCard = fixture.debugElement.query(By.css('.artist-card'));
    artistCard.triggerEventHandler('click', null);
    
    expect(router.navigate).toHaveBeenCalledWith(['/artist', '1']);
  });
});
