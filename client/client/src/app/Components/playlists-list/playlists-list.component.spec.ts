import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlaylistsListComponent } from './playlists-list.component';
import { PlaylistService } from '../../core/services/playlist.service';
import { SnackBarService } from '../../core/services/snack-bar.service';
import { UserService } from '../../core/services/user.service';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { Playlist } from '../../core/models/Playlist.model';

describe('PlaylistsListComponent', () => {
  let component: PlaylistsListComponent;
  let fixture: ComponentFixture<PlaylistsListComponent>;
  let playlistServiceSpy: jasmine.SpyObj<PlaylistService>;
  let snackBarServiceSpy: jasmine.SpyObj<SnackBarService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    playlistServiceSpy = jasmine.createSpyObj('PlaylistService', ['getSpotifyPlaylistsByUserId', 'deletePlaylist', 'createPlaylist']);
    snackBarServiceSpy = jasmine.createSpyObj('SnackBarService', ['success', 'error']);
    userServiceSpy = jasmine.createSpyObj('UserService', ['extractUserIdFromToken']);

    await TestBed.configureTestingModule({
      declarations: [PlaylistsListComponent],
      providers: [
        FormBuilder,
        { provide: PlaylistService, useValue: playlistServiceSpy },
        { provide: SnackBarService, useValue: snackBarServiceSpy },
        { provide: UserService, useValue: userServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlaylistsListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle create form visibility', () => {
    expect(component.showCreateForm).toBeFalse();
    component.toggleCreateForm();
    expect(component.showCreateForm).toBeTrue();
    component.toggleCreateForm();
    expect(component.showCreateForm).toBeFalse();
  });

  it('should set playlist visibility', () => {
    component.setVisibility(true);
    expect(component.createPlaylistForm.value.isPublic).toBeTrue();

    component.setVisibility(false);
    expect(component.createPlaylistForm.value.isPublic).toBeFalse();
  });
  it('should fetch playlists on init', () => {
    const mockResponse = {
      playlists: [{
        id: '1', 
        name: 'Test Playlist', 
        isPublic: true, 
        description: '',
        userId: '',
        externalUrl: '',
        imageUrls: [],
        ownerDisplayName: '',
        ownerUri: '',
        snapshotId: '',
        songs: []
      }],
      total: 1,
      limit: 10,
      offset: 0,
      next: '',  
      previous: ''
    };
    
    playlistServiceSpy.getSpotifyPlaylistsByUserId.and.returnValue(of(mockResponse));
    
  
    component.fetchPlaylists();
    fixture.detectChanges();
  
    expect(component.playlists.length).toBe(1);
    expect(component.isLoading).toBeFalse();
  });
  

  it('should delete a playlist', () => {
    const playlistId = '1';
    component.playlists = [{
      id: '1', name: 'Test Playlist', isPublic: true, description: '',
      userId: '',
      externalUrl: '',
      imageUrls: [],
      ownerDisplayName: '',
      ownerUri: '',
      snapshotId: '',
      songs: []
    }];
    playlistServiceSpy.deletePlaylist.and.returnValue(of({}));

    component.deletePlaylist(playlistId);

    expect(playlistServiceSpy.deletePlaylist).toHaveBeenCalledWith(playlistId);
    expect(snackBarServiceSpy.success).toHaveBeenCalledWith('Playlist deleted successfully');
    expect(component.playlists.length).toBe(0);
  });

  it('should create a new playlist', () => {
    component.createPlaylistForm.setValue({ name: 'New Playlist', description: 'A test playlist', isPublic: true });
    component.userId = '123';
    const newPlaylist: Playlist = { 
      id: '2', 
      name: 'New Playlist', 
      isPublic: true, 
      description: 'A test playlist',
      userId: '123', 
      externalUrl: '', 
      imageUrls: [], 
      ownerDisplayName: '', 
      ownerUri: '', 
      snapshotId: '',
      songs: [] 
    };
    playlistServiceSpy.createPlaylist.and.returnValue(of(newPlaylist));

    component.createPlaylist(new Event('submit'));

    expect(playlistServiceSpy.createPlaylist).toHaveBeenCalled();
    expect(snackBarServiceSpy.success).toHaveBeenCalledWith('Playlist created successfully');
    expect(component.playlists.length).toBe(1);
  });
});