import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserProfilComponent } from './user-profil.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserProfileService } from '../../core/services/user-profile.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';
import { SpotifyUserProfile } from '../../core/models/SpotifyUserProfile.model';

describe('UserProfilComponent', () => {
  let component: UserProfilComponent;
  let fixture: ComponentFixture<UserProfilComponent>;
  let userProfileService: UserProfileService;
  let httpTestingController: HttpTestingController;

  const mockUserProfile: SpotifyUserProfile = {
    display_name: 'John Doe',
    email: 'john.doe@example.com',
    country: 'US',
    product: 'premium',
    uri: 'spotify:artist:12345',
    images: [{ url: 'https://example.com/image.jpg' }],
    external_urls: { spotify: 'https://spotify.com/johndoe' },
    id: ''
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        CommonModule,
        HttpClientTestingModule,
        UserProfilComponent
      ],
      providers: [UserProfileService]
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfilComponent);
    component = fixture.componentInstance;
    userProfileService = TestBed.inject(UserProfileService);
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load user profile on init', () => {
    spyOn(userProfileService, 'getUserProfile').and.returnValue(of(mockUserProfile));
    
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.userProfile).toEqual(mockUserProfile);
  });

  it('should display error message if loading the profile fails', () => {
    spyOn(userProfileService, 'getUserProfile').and.returnValue(throwError('Error'));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Failed to load user profile.');
  });

  it('should open Spotify profile when "View Profile" button is clicked', (done) => {
    spyOn(window, 'open');
    component.userProfile = mockUserProfile;
  
    fixture.detectChanges();  // Trigger change detection
  
    fixture.whenStable().then(() => {
      console.log('Stable state reached, continuing test...');
      const button = fixture.debugElement.nativeElement.querySelector('.view-profile');
      
      expect(button).toBeTruthy();
  
      button.click();
      expect(window.open).toHaveBeenCalledWith(mockUserProfile.external_urls.spotify, '_blank');
      done();
    }).catch((error) => {
      console.error('Error in whenStable:', error);
      done.fail(error);  // Fail the test if there is an error
    });
  }, 10000);  // Custom timeout for this test  

  it('should call editProfilePicture when "Edit" button is clicked', (done) => {
    spyOn(component, 'editProfilePicture');
    
    component.userProfile = mockUserProfile;
    fixture.detectChanges(); 
  
    fixture.whenStable().then(() => {
      const button = fixture.debugElement.nativeElement.querySelector('.edit-button');
      
      expect(button).toBeTruthy();
      
      button.click();
      expect(component.editProfilePicture).toHaveBeenCalled();

      done();
    });
  }, 10000);  

   
});
