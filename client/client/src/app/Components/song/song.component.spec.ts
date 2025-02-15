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
});
