import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SongDetailsComponent } from './song-details.component';
import { SongService } from '../../core/services/song.service';
import { FollowedArtistService } from '../../core/services/followed-artist.service';
import { PlaylistService } from '../../core/services/playlist.service';
import { SnackBarService } from '../../core/services/snack-bar.service';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Song } from '../../core/models/Song.model';
import { SpotifyPaginatedPlaylists } from '../../core/models/SpotifyPaginatedPlaylists.model';
import { FollowedArtist } from '../../core/models/FollowedArtist.model'; // Import the FollowedArtist interface

describe('SongDetailsComponent', () => {
  let component: SongDetailsComponent;
  let fixture: ComponentFixture<SongDetailsComponent>;
  let songService: jasmine.SpyObj<SongService>;
  let followedArtistService: jasmine.SpyObj<FollowedArtistService>;
  let playlistService: jasmine.SpyObj<PlaylistService>;
  let snackBarService: jasmine.SpyObj<SnackBarService>;

  const mockSong: Song = {
    id: '1',
    name: 'Song Name',
    artists: [
      {
        id: 'artist1',
        name: 'Artist Name',
        genres: ['Pop'],
        popularity: 80,
        followers: { total: 1000 },
        images: [{ url: 'image-url', height: 100, width: 100 }],
        imageUrl: 'image-url',
      },
    ],
    album: { name: 'Album Name', imageUrl: 'album-image-url' },
    durationMs: 300000,
    previewUrl: 'preview-url',
    popularity: 90,
    duration_ms: 300000, 
  };

  const mockPlaylists: SpotifyPaginatedPlaylists = {
    total: 100,
    limit: 10,
    offset: 0,
    next: 'next_url',
    previous: 'previous_url',
    playlists: [
      {
        id: 'playlist1',
        name: 'Playlist 1',
        description: 'Description 1',
        userId: 'user1',
        isPublic: true,
        externalUrl: 'https://example.com/playlist1',
        imageUrls: ['image1_url'],
        ownerDisplayName: 'Owner 1',
        ownerUri: 'https://example.com/owner1',
        snapshotId: 'snapshot1',
        songs: [],
      },
    ],
  };

  const mockFollowedArtists: FollowedArtist[] = [
    {
      id: 'artist1',
      name: 'Artist Name',
      images: [{ url: 'image-url', height: 100, width: 100 }],
      type: 'artist',
      genre: ['Pop'],
      popularity: 80,
      followers: 1000 , 
    },
  ];

  beforeEach(() => {
    const songServiceSpy = jasmine.createSpyObj('SongService', ['getOneSong']);
    const followedArtistServiceSpy = jasmine.createSpyObj('FollowedArtistService', ['getFollowedArtist', 'followArtist', 'unfollowArtist']);
    const playlistServiceSpy = jasmine.createSpyObj('PlaylistService', ['getSpotifyPlaylistsByUserId', 'addSongToPlaylist']);
    const snackBarServiceSpy = jasmine.createSpyObj('SnackBarService', ['success', 'error']);

    TestBed.configureTestingModule({
      declarations: [SongDetailsComponent],
      imports: [
        MatSliderModule,
        FormsModule,
        MatMenuModule,
        MatSnackBarModule,
      ],
      providers: [
        { provide: SongService, useValue: songServiceSpy },
        { provide: FollowedArtistService, useValue: followedArtistServiceSpy },
        { provide: PlaylistService, useValue: playlistServiceSpy },
        { provide: SnackBarService, useValue: snackBarServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1',
              },
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    songService = TestBed.inject(SongService) as jasmine.SpyObj<SongService>;
    followedArtistService = TestBed.inject(FollowedArtistService) as jasmine.SpyObj<FollowedArtistService>;
    playlistService = TestBed.inject(PlaylistService) as jasmine.SpyObj<PlaylistService>;
    snackBarService = TestBed.inject(SnackBarService) as jasmine.SpyObj<SnackBarService>;

    songService.getOneSong.and.returnValue(of(mockSong));
    followedArtistService.getFollowedArtist.and.returnValue(of(mockFollowedArtists));
    playlistService.getSpotifyPlaylistsByUserId.and.returnValue(of(mockPlaylists));

    fixture = TestBed.createComponent(SongDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load song details on initialization', () => {
    expect(songService.getOneSong).toHaveBeenCalledWith('1');
    expect(component.song).toEqual(mockSong);
  });

  it('should check if the user is following the artist', () => {
    component.getSongDetails();
    expect(followedArtistService.getFollowedArtist).toHaveBeenCalled();
  });

});
