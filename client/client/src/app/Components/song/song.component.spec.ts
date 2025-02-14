import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SongComponent } from './song.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatIconModule } from '@angular/material/icon';
import { Song } from '../../core/models/Song.model';
import { of } from 'rxjs';

describe('SongComponent', () => {
  let component: SongComponent;
  let fixture: ComponentFixture<SongComponent>;

  const mockSong: Song = {
    id: '123',
    name: 'Test Song',
    artists: [{
      name: 'Test Artist',
      id: '',
      genres: [],
      popularity: 0,
      images: [],
      imageUrl: '',
      followers: { total: 0 },
    }],
    album: {
      imageUrl: 'https://example.com/album.jpg',
      name: ''
    },
    popularity: 80,
    durationMs: 210000,
    duration_ms: 0,
    previewUrl: ''
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongComponent, MatIconModule, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SongComponent);
    component = fixture.componentInstance;
    component.song = mockSong;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display song details correctly', () => {
    const songTitle = fixture.nativeElement.querySelector('.song-title');
    const songArtist = fixture.nativeElement.querySelector('.song-artist');
    const albumImage = fixture.nativeElement.querySelector('.album-image');
    const popularityText = fixture.nativeElement.querySelector('.popularity-text');
    const durationText = fixture.nativeElement.querySelector('.song-duration');

    expect(songTitle.textContent).toBe('Test Song');
    expect(songArtist.textContent).toBe('Test Artist');
    expect(albumImage.src).toBe('https://example.com/album.jpg');
    expect(popularityText.textContent).toBe('Popularity: 80');
    expect(durationText.textContent).toBe('3:30');
  });

  it('should emit playRequest event when play button is clicked', () => {
    spyOn(component.playRequest, 'emit');
    const playButton = fixture.nativeElement.querySelector('.play-btn');
    playButton.click();
    expect(component.playRequest.emit).toHaveBeenCalledWith('123');
  });

  it('should emit deleteRequest event when delete button is clicked', () => {
    spyOn(component.deleteRequest, 'emit');
    const deleteButton = fixture.nativeElement.querySelector('.delete-btn');
    deleteButton.click();
    expect(component.deleteRequest.emit).toHaveBeenCalledWith('123');
  });

  it('should not display delete button when showDeleteButton is false', () => {
    component.showDeleteButton = false;
    fixture.detectChanges();
    const deleteButton = fixture.nativeElement.querySelector('.delete-btn');
    expect(deleteButton).toBeNull();
  });

  it('should navigate to song details page when song card is clicked', () => {
    const spy = spyOn(component['router'], 'navigate');
    const card = fixture.nativeElement.querySelector('.song-card');
    card.click();
    expect(spy).toHaveBeenCalledWith(['/song', '123']);
  });

  it('should format duration correctly', () => {
    const formattedDuration = component.formatDuration(mockSong.durationMs);
    expect(formattedDuration).toBe('3:30');
  });
});
