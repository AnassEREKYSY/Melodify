import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlaylistDetailsComponent } from './playlist-details.component';
import { PlaylistService } from '../../core/services/playlist.service';
import { SnackBarService } from '../../core/services/snack-bar.service';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { Song } from '../../core/models/Song.model';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { Playlist } from '../../core/models/Playlist.model';

describe('PlaylistDetailsComponent', () => {
  let component: PlaylistDetailsComponent;
  let fixture: ComponentFixture<PlaylistDetailsComponent>;
  let playlistServiceSpy: jasmine.SpyObj<PlaylistService>;
  let snackBarServiceSpy: jasmine.SpyObj<SnackBarService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: Partial<ActivatedRoute>;

  beforeEach(async () => {
    playlistServiceSpy = jasmine.createSpyObj('PlaylistService', [
      'getOnePlaylist',
      'getSongsFromPlaylist',
      'removeSongFromPlaylist',
      'deletePlaylist'
    ]);
    snackBarServiceSpy = jasmine.createSpyObj('SnackBarService', ['success', 'error']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteSpy = {
      snapshot: {
        paramMap: convertToParamMap({ id: '1' }),
        queryParamMap: convertToParamMap({})
      } as ActivatedRouteSnapshot
    };

    await TestBed.configureTestingModule({
      imports: [MatIconModule, PlaylistDetailsComponent],
      providers: [
        { provide: PlaylistService, useValue: playlistServiceSpy },
        { provide: SnackBarService, useValue: snackBarServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlaylistDetailsComponent);
    component = fixture.componentInstance;
    const service = TestBed.inject(PlaylistService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

//   it('should display the playlist details', () => {
//     const mockPlaylist: Playlist = {
//         id: '1',
//         name: 'Test Playlist',
//         description: 'A test playlist description', 
//         userId: 'user123', 
//         isPublic: true, 
//         externalUrl: 'https://example.com/playlist', 
//         imageUrls: ['https://example.com/playlist.jpg'],
//         ownerDisplayName: 'Test User',
//         ownerUri: 'https://example.com/user', 
//         snapshotId: 'snapshot_123', 
//         songs: [] 
//     };      

//     playlistServiceSpy.getOnePlaylist.and.returnValue(of(mockPlaylist));
//     playlistServiceSpy.getSongsFormPlaylist.and.returnValue(of([]));

//     component.ngOnInit(); 

//     fixture.detectChanges(); 

//     const title = fixture.debugElement.query(By.css('.album-title')).nativeElement;
//     const owner = fixture.debugElement.query(By.css('.album-owner')).nativeElement;
//     const image = fixture.debugElement.query(By.css('.album-image')).nativeElement;

//     expect(title.textContent).toContain(mockPlaylist.name);
//     expect(owner.textContent).toContain(mockPlaylist.ownerDisplayName);
//     expect(image.src).toBe(mockPlaylist.imageUrls[0]);
//   });

//   it('should display a placeholder if no image is available', () => {
//     const mockPlaylist: Playlist = {
//         id: '1',
//         name: 'Test Playlist',
//         description: 'A test playlist description', 
//         userId: 'user123', 
//         isPublic: true, 
//         externalUrl: 'https://example.com/playlist', 
//         imageUrls: ['https://example.com/playlist.jpg'],
//         ownerDisplayName: 'Test User',
//         ownerUri: 'https://example.com/user', 
//         snapshotId: 'snapshot_123', 
//         songs: [] 
//     }; 

//     playlistServiceSpy.getOnePlaylist.and.returnValue(of(mockPlaylist));
//     playlistServiceSpy.getSongsFormPlaylist.and.returnValue(of([]));

//     component.ngOnInit();
//     fixture.detectChanges();

//     const placeholder = fixture.debugElement.query(By.css('.album-image.no-image'));
//     expect(placeholder).toBeTruthy();
//   });

//   it('should call onDeletePlaylist when delete button is clicked', () => {
//     const mockPlaylistId = '1';

//     spyOn(component, 'onDeletePlaylist');

//     const button = fixture.debugElement.query(By.css('.delete-button')).nativeElement;
//     button.click();

//     expect(component.onDeletePlaylist).toHaveBeenCalledWith(mockPlaylistId);
//   });

//   it('should display "No songs found!" when the playlist has no songs', () => {
//     const mockPlaylist: Playlist = {
//         id: '1',
//         name: 'Test Playlist',
//         description: 'A test playlist description', 
//         userId: 'user123', 
//         isPublic: true, 
//         externalUrl: 'https://example.com/playlist', 
//         imageUrls: ['https://example.com/playlist.jpg'],
//         ownerDisplayName: 'Test User',
//         ownerUri: 'https://example.com/user', 
//         snapshotId: 'snapshot_123', 
//         songs: [] 
//     }; 

//     playlistServiceSpy.getOnePlaylist.and.returnValue(of(mockPlaylist));
//     playlistServiceSpy.getSongsFormPlaylist.and.returnValue(of([])); 

//     component.ngOnInit();

//     fixture.detectChanges();

//     const noSongsMessage = fixture.debugElement.query(By.css('.text-gray-400')).nativeElement;
//     expect(noSongsMessage.textContent).toBe('No songs found!');
//   });

//   it('should display songs when they are returned from the service', () => {
//     const mockPlaylist: Playlist = {
//         id: '1',
//         name: 'Test Playlist',
//         description: 'A test playlist description', 
//         userId: 'user123', 
//         isPublic: true, 
//         externalUrl: 'https://example.com/playlist', 
//         imageUrls: ['https://example.com/playlist.jpg'],
//         ownerDisplayName: 'Test User',
//         ownerUri: 'https://example.com/user', 
//         snapshotId: 'snapshot_123', 
//         songs: [] 
//     }; 

//     const mockSongs: Song[] = [
//       {
//         id: '1',
//         name: 'Song 1',
//         artists: [{
//             name: 'Artist 1',
//             id: '',
//             genres: [],
//             popularity: 0,
//             followers: {total:0},
//             images: [],
//             imageUrl: ''
//         }],
//         album: { name: 'Album 1', imageUrl: '' },
//         previewUrl: '',
//         popularity: 90,
//         durationMs: 200000,
//         duration_ms: 200000
//       },
//       {
//         id: '2',
//         name: 'Song 2',
//         artists: [{
//             name: 'Artist 2',
//             id: '',
//             genres: [],
//             popularity: 0,
//             followers: {total:0},
//             images: [],
//             imageUrl: ''
//         }],
//         album: { name: 'Album 2', imageUrl: '' },
//         previewUrl: '',
//         popularity: 85,
//         durationMs: 200000,
//         duration_ms: 200000
//       }
//     ];

//     playlistServiceSpy.getOnePlaylist.and.returnValue(of(mockPlaylist));
//     playlistServiceSpy.getSongsFormPlaylist.and.returnValue(of(mockSongs));

//     component.ngOnInit();

//     fixture.detectChanges();

//     const songElements = fixture.debugElement.queryAll(By.css('app-song'));
//     expect(songElements.length).toBe(mockSongs.length);
//   });

//   it('should call onPlay when a song is requested to play', () => {
//     const mockSong: Song = {
//       id: '1',
//       name: 'Test Song',
//       artists: [{
//           name: 'Test Artist',
//           id: '',
//           genres: [],
//           popularity: 0,
//           followers: {total:0},
//           images: [],
//           imageUrl: ''
//       }],
//       album: { name: 'Test Album', imageUrl: '' },
//       previewUrl: '',
//       popularity: 80,
//       durationMs: 180000,
//       duration_ms: 180000
//     };

//     spyOn(component, 'onPlay');

//     const songComponent = fixture.debugElement.query(By.css('app-song'));
//     songComponent.triggerEventHandler('playRequest', mockSong);

//     expect(component.onPlay).toHaveBeenCalledWith(mockSong.id);
//   });

//   it('should call onDelete when a song is requested to be deleted', () => {
//     const mockSong: Song = {
//         id: 'song1',
//         name: 'Song 1',
//         artists: [{ id: 'artist1', name: 'Artist 1', genres: [], popularity: 80, followers: { total: 1000 }, images: [], imageUrl: '' }],
//         album: { name: 'Album 1', imageUrl: '' },
//         durationMs: 200000,
//         duration_ms: 200000,
//         previewUrl: '',
//         popularity: 80
//     };

//     spyOn(component, 'onDelete');

//     const songComponent = fixture.debugElement.query(By.css('app-song'));
//     songComponent.triggerEventHandler('deleteRequest', mockSong);

//     expect(component.onDelete).toHaveBeenCalledWith(mockSong.id);
//   });
});
