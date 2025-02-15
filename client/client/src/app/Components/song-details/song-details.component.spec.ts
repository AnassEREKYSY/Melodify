// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { SongDetailsComponent } from './song-details.component';
// import { SongService } from '../../core/services/song.service';
// import { FollowedArtistService } from '../../core/services/followed-artist.service';
// import { PlaylistService } from '../../core/services/playlist.service';
// import { SnackBarService } from '../../core/services/snack-bar.service';
// import { ActivatedRoute } from '@angular/router';
// import { of, BehaviorSubject } from 'rxjs';
// import { MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatMenuModule } from '@angular/material/menu';
// import { MatSliderModule } from '@angular/material/slider';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { NO_ERRORS_SCHEMA } from '@angular/core';
// import { HttpClientModule } from '@angular/common/http';

// // Mock services
// class MockSongService {}
// class MockFollowedArtistService {}
// class MockPlaylistService {}
// class MockSnackBarService {}

// describe('SongDetailsComponent', () => {
//   let component: SongDetailsComponent;
//   let fixture: ComponentFixture<SongDetailsComponent>;

//   beforeEach(() => {
//     // Create a BehaviorSubject to mock the paramMap
//     const mockActivatedRoute = {
//       paramMap: new BehaviorSubject({ get: () => 'mockedSongId' })
//     };

//     TestBed.configureTestingModule({
//       imports: [
//         MatSliderModule,
//         FormsModule,
//         MatMenuModule,
//         MatSnackBarModule,
//         SongDetailsComponent,  // Standalone component should be in imports
//         ReactiveFormsModule,
//         HttpClientModule
//       ],
//       providers: [
//         { provide: SongService, useClass: MockSongService },
//         { provide: FollowedArtistService, useClass: MockFollowedArtistService },
//         { provide: PlaylistService, useClass: MockPlaylistService },
//         { provide: SnackBarService, useClass: MockSnackBarService },
//         {
//           provide: ActivatedRoute,
//           useValue: mockActivatedRoute // Provide the mocked ActivatedRoute
//         }
//       ],
//       schemas: [NO_ERRORS_SCHEMA],
//     });
//     fixture = TestBed.createComponent(SongDetailsComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create the component', () => {
//     expect(component).toBeTruthy();
//   });
// });
