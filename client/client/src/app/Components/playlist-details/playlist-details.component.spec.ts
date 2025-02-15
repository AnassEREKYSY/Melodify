import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlaylistDetailsComponent } from './playlist-details.component';
import { PlaylistService } from '../../core/services/playlist.service';
import { SnackBarService } from '../../core/services/snack-bar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Playlist } from '../../core/models/Playlist.model';
import { Song } from '../../core/models/Song.model';
import { Artist } from '../../core/models/Artist.model';
import { MatIconModule } from '@angular/material/icon';

describe('PlaylistDetailsComponent', () => {
  let component: PlaylistDetailsComponent;
  let fixture: ComponentFixture<PlaylistDetailsComponent>;
  let playlistServiceSpy: jasmine.SpyObj<PlaylistService>;
  let snackBarServiceSpy: jasmine.SpyObj<SnackBarService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    playlistServiceSpy = jasmine.createSpyObj('PlaylistService', ['getOnePlaylist', 'getSongsFormPlaylist', 'removeSongFromPlaylist', 'deletePlaylist']);
    snackBarServiceSpy = jasmine.createSpyObj('SnackBarService', ['success', 'error']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteSpy = { snapshot: { paramMap: { get: jasmine.createSpy('get').and.returnValue('1') } } } as any;

    await TestBed.configureTestingModule({
      declarations: [PlaylistDetailsComponent],
      imports: [MatIconModule],
      providers: [
        { provide: PlaylistService, useValue: playlistServiceSpy },
        { provide: SnackBarService, useValue: snackBarServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlaylistDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch songs for the playlist', () => {
    const mockArtists: Artist[] = [
      { id: '1', name: 'Artist 1', genres: ['pop'], popularity: 90, followers: { total: 1000 }, images: [], imageUrl: '' }
    ];

    const mockSongs: Song[] = [
      {
        id: '1',
        name: 'Song 1',
        artists: mockArtists,
        album: { name: 'Album 1', imageUrl: 'https://example.com/album1.jpg' },
        durationMs: 180000,
        duration_ms: 180000,
        previewUrl: 'https://example.com/preview1.mp3',
        popularity: 85
      },
      {
        id: '2',
        name: 'Song 2',
        artists: mockArtists,
        album: { name: 'Album 2', imageUrl: 'https://example.com/album2.jpg' },
        durationMs: 200000,
        duration_ms: 200000,
        previewUrl: 'https://example.com/preview2.mp3',
        popularity: 78
      }
    ];
    playlistServiceSpy.getSongsFormPlaylist.and.returnValue(of(mockSongs));

    component.getSongsForPlaylist();

    expect(playlistServiceSpy.getSongsFormPlaylist).toHaveBeenCalledWith('1');
    expect(component.songs.length).toBe(2);
    expect(component.songs).toEqual(mockSongs);
  });
});