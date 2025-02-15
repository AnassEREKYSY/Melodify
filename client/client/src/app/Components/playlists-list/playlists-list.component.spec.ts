// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { PlaylistsListComponent } from './playlists-list.component';
// import { PlaylistService } from '../../core/services/playlist.service';
// import { SnackBarService } from '../../core/services/snack-bar.service';
// import { UserService } from '../../core/services/user.service';
// import { FormBuilder } from '@angular/forms';

// describe('PlaylistsListComponent', () => {
//   let component: PlaylistsListComponent;
//   let fixture: ComponentFixture<PlaylistsListComponent>;
//   let playlistServiceSpy: jasmine.SpyObj<PlaylistService>;
//   let snackBarServiceSpy: jasmine.SpyObj<SnackBarService>;
//   let userServiceSpy: jasmine.SpyObj<UserService>;
//   let formBuilder: FormBuilder;

//   beforeEach(async () => {
//     playlistServiceSpy = jasmine.createSpyObj('PlaylistService', [
//       'getSpotifyPlaylistsByUserId', 
//       'deletePlaylist', 
//       'createPlaylist'
//     ]);
//     snackBarServiceSpy = jasmine.createSpyObj('SnackBarService', ['success', 'error']);
//     userServiceSpy = jasmine.createSpyObj('UserService', ['extractUserIdFromToken']);

//     await TestBed.configureTestingModule({
//       imports: [],
//       declarations: [PlaylistsListComponent],
//       providers: [
//         FormBuilder,
//         { provide: PlaylistService, useValue: playlistServiceSpy },
//         { provide: SnackBarService, useValue: snackBarServiceSpy },
//         { provide: UserService, useValue: userServiceSpy }
//       ]
//     }).compileComponents();

//     fixture = TestBed.createComponent(PlaylistsListComponent);
//     component = fixture.componentInstance;
//     formBuilder = TestBed.inject(FormBuilder);
//     component.createPlaylistForm = formBuilder.group({
//       name: '',
//       description: '',
//       isPublic: false
//     });
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
