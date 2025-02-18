import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SongComponent } from './song.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatIconModule } from '@angular/material/icon';
import { Song } from '../../core/models/Song.model';
import { By } from '@angular/platform-browser';

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
      name: 'Test Album'
    },
    popularity: 80,
    durationMs: 210000,
    duration_ms: 210000,
    previewUrl: ''
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatIconModule, SongComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SongComponent);
    component = fixture.componentInstance;
    component.song = mockSong;
    component.showDeleteButton = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display song name and artist', () => {
    const songTitle = fixture.debugElement.query(By.css('.song-title')).nativeElement;
    const songArtist = fixture.debugElement.query(By.css('.song-artist')).nativeElement;

    expect(songTitle.textContent).toContain(mockSong.name);
    expect(songArtist.textContent).toContain(mockSong.artists[0].name);
  });

  it('should display the album image', () => {
    const albumImage = fixture.debugElement.query(By.css('.album-image'));
    expect(albumImage).toBeTruthy();
    expect(albumImage.nativeElement.src).toBe(mockSong.album.imageUrl);
  });

  it('should call goToDetails when song card is clicked', () => {
    spyOn(component, 'goToDetails');
    
    const songCard = fixture.debugElement.query(By.css('.song-card'));
    songCard.triggerEventHandler('click', null);

    expect(component.goToDetails).toHaveBeenCalledWith(mockSong.id);
  });

  it('should call playSong when play button is clicked', () => {
    spyOn(component, 'playSong');

    const playButton = fixture.debugElement.query(By.css('.play-btn'));
    playButton.triggerEventHandler('click', new Event('click'));

    expect(component.playSong).toHaveBeenCalledWith(mockSong.id);
  });

  it('should call deleteSong when delete button is clicked', () => {
    spyOn(component, 'deleteSong');

    const deleteButton = fixture.debugElement.query(By.css('.delete-btn'));
    deleteButton.triggerEventHandler('click', new Event('click'));

    expect(component.deleteSong).toHaveBeenCalledWith(mockSong.id, jasmine.any(Event));
  });

  it('should format duration correctly', () => {
    spyOn(component, 'formatDuration').and.callThrough();
    fixture.detectChanges();

    const durationText = fixture.debugElement.query(By.css('.song-duration')).nativeElement.textContent;
    
    expect(component.formatDuration).toHaveBeenCalledWith(mockSong.durationMs);
    expect(durationText).toBe('3:30'); 
  });
});
