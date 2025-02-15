import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ArtistDetailsComponent } from './artist-details.component';
import { ArtistService } from '../../core/services/artist.service';
import { FollowedArtistService } from '../../core/services/followed-artist.service';
import { Song } from '../../core/models/Song.model';
import { Artist } from '../../core/models/Artist.model';
import { SongComponent } from '../song/song.component';
import { CommonModule } from '@angular/common';
import { FollowedArtist } from '../../core/models/FollowedArtist.model';

describe('ArtistDetailsComponent', () => {
  let component: ArtistDetailsComponent;
  let fixture: ComponentFixture<ArtistDetailsComponent>;
  let artistServiceSpy: jasmine.SpyObj<ArtistService>;
  let followedArtistServiceSpy: jasmine.SpyObj<FollowedArtistService>;
  let activatedRouteSpy: any;

  beforeEach(async () => {
    artistServiceSpy = jasmine.createSpyObj('ArtistService', ['getArtistById', 'getArtistTopSongs']);
    followedArtistServiceSpy = jasmine.createSpyObj('FollowedArtistService', ['followArtist', 'unfollowArtist', 'getFollowedArtist']);
    activatedRouteSpy = { snapshot: { paramMap: { get: jasmine.createSpy('get').and.returnValue('1') } } };

    await TestBed.configureTestingModule({
      imports: [CommonModule, SongComponent],
      declarations: [ArtistDetailsComponent],
      providers: [
        { provide: ArtistService, useValue: artistServiceSpy },
        { provide: FollowedArtistService, useValue: followedArtistServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArtistDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch artist details on init', () => {
    const mockArtist: Artist = { id: '1', name: 'Artist Name', genres: ['Pop'], popularity: 80, followers: { total: 1000 }, images: [], imageUrl: '' };
    artistServiceSpy.getArtistById.and.returnValue(of(mockArtist));

    component.ngOnInit();
    expect(artistServiceSpy.getArtistById).toHaveBeenCalledWith('1');
    expect(component.artist).toEqual(mockArtist);
  });

  it('should fetch artist songs on init', () => {
    const mockSongs: Song[] = [{ id: '1', name: 'Song 1', artists: [], album: { name: 'Album', imageUrl: '' }, durationMs: 200000, duration_ms: 200000, previewUrl: '', popularity: 50 }];
    artistServiceSpy.getArtistTopSongs.and.returnValue(of(mockSongs));

    component.getArtistSongs();
    expect(artistServiceSpy.getArtistTopSongs).toHaveBeenCalledWith('1');
    expect(component.songs).toEqual(mockSongs);
  });

  it('should handle error when fetching artist details', () => {
    artistServiceSpy.getArtistById.and.returnValue(throwError(() => new Error('Artist not found')));

    component.getArtistDetails();
    expect(component.artist).toBeUndefined();
  });

  it('should handle error when fetching artist songs', () => {
    artistServiceSpy.getArtistTopSongs.and.returnValue(throwError(() => new Error('Songs not found')));

    component.getArtistSongs();
    expect(component.songs.length).toBe(0);
  });

  it('should follow an artist', () => {
    followedArtistServiceSpy.followArtist.and.returnValue(of({}));

    component.followArtist();
    expect(followedArtistServiceSpy.followArtist).toHaveBeenCalledWith('1');
    expect(component.isFollowing).toBeTrue();
  });

  it('should unfollow an artist', () => {
    followedArtistServiceSpy.unfollowArtist.and.returnValue(of({}));

    component.unfollowArtist();
    expect(followedArtistServiceSpy.unfollowArtist).toHaveBeenCalledWith('1');
    expect(component.isFollowing).toBeFalse();
  });

  it('should check if an artist is followed', () => {
    const followedArtists: FollowedArtist[] = [{
      id: '1',
      name: 'Artist Name',
      images: [{ url: 'imageUrl', height: 100, width: 100 }],  
      type: 'artist',
      genre: [],  
      popularity: 0,
      followers: 0, 
    }];
    
    followedArtistServiceSpy.getFollowedArtist.and.returnValue(of(followedArtists));
  
    component.checkIfFollowing();
    expect(followedArtistServiceSpy.getFollowedArtist).toHaveBeenCalled();
    expect(component.isFollowing).toBeTrue();
  });
  
  

  it('should toggle follow status', () => {
    spyOn(component, 'followArtist');
    spyOn(component, 'unfollowArtist');

    component.isFollowing = false;
    component.toggleFollow();
    expect(component.followArtist).toHaveBeenCalled();

    component.isFollowing = true;
    component.toggleFollow();
    expect(component.unfollowArtist).toHaveBeenCalled();
  });

  it('should format followers correctly', () => {
    expect(component.formatFollowers(1500)).toBe('1.5K');
    expect(component.formatFollowers(2000000)).toBe('2M');
    expect(component.formatFollowers(900)).toBe('900');
  });
});
