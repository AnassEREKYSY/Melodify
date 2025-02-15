// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { PlaylistDetailsComponent } from './playlist-details.component';
// import { PlaylistService } from '../../core/services/playlist.service';
// import { SnackBarService } from '../../core/services/snack-bar.service';
// import { ActivatedRoute, ActivatedRouteSnapshot, Router, convertToParamMap } from '@angular/router';
// import { of } from 'rxjs';
// import { Song } from '../../core/models/Song.model';
// import { Artist } from '../../core/models/Artist.model';
// import { MatIconModule } from '@angular/material/icon';

// describe('PlaylistDetailsComponent', () => {
//   let component: PlaylistDetailsComponent;
//   let fixture: ComponentFixture<PlaylistDetailsComponent>;
//   let playlistServiceSpy: jasmine.SpyObj<PlaylistService>;
//   let snackBarServiceSpy: jasmine.SpyObj<SnackBarService>;
//   let routerSpy: jasmine.SpyObj<Router>;
//   let activatedRouteSpy: Partial<ActivatedRoute>;

//   beforeEach(async () => {
//     playlistServiceSpy = jasmine.createSpyObj('PlaylistService', [
//       'getOnePlaylist',
//       'getSongsFromPlaylist', // Fixed method name
//       'removeSongFromPlaylist',
//       'deletePlaylist'
//     ]);
//     snackBarServiceSpy = jasmine.createSpyObj('SnackBarService', ['success', 'error']);
//     routerSpy = jasmine.createSpyObj('Router', ['navigate']);
//     activatedRouteSpy = {
//       snapshot: {
//         paramMap: convertToParamMap({ id: '1' }),
//         queryParamMap: convertToParamMap({})
//       } as ActivatedRouteSnapshot
//     };

//     await TestBed.configureTestingModule({
//       imports: [MatIconModule],
//       declarations: [PlaylistDetailsComponent], // Moved from imports to declarations
//       providers: [
//         { provide: PlaylistService, useValue: playlistServiceSpy },
//         { provide: SnackBarService, useValue: snackBarServiceSpy },
//         { provide: Router, useValue: routerSpy },
//         { provide: ActivatedRoute, useValue: activatedRouteSpy }
//       ]
//     }).compileComponents();

//     fixture = TestBed.createComponent(PlaylistDetailsComponent);
//     component = fixture.componentInstance;
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
