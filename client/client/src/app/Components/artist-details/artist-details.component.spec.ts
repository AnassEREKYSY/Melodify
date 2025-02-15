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
      imports: [CommonModule, SongComponent,ArtistDetailsComponent],
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

});
