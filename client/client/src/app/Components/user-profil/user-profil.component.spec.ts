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
      ],
      declarations: [UserProfilComponent],
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

  it('should load the user profile on init', () => {
    spyOn(userProfileService, 'getUserProfile').and.returnValue(of(mockUserProfile));
    component.ngOnInit();
    expect(component.userProfile).toEqual(mockUserProfile);
  });

  it('should display error message if profile loading fails', () => {
    spyOn(userProfileService, 'getUserProfile').and.returnValue(throwError('Error loading profile'));
    component.ngOnInit();
    expect(component.errorMessage).toBe('Failed to load user profile.');
  });

  it('should open user profile in a new tab when viewProfile is called', () => {
    spyOn(window, 'open');
    component.userProfile = mockUserProfile;
    component.viewProfile();
    expect(window.open).toHaveBeenCalledWith(mockUserProfile.external_urls.spotify, '_blank');
  });

  it('should not open user profile if no URL is available', () => {
    spyOn(window, 'open');
    component.userProfile = { ...mockUserProfile, external_urls: {
      spotify: ''
    } };
    component.viewProfile();
    expect(window.open).not.toHaveBeenCalled();
  });

  it('should trigger editProfilePicture on button click', () => {
    spyOn(component, 'editProfilePicture');
    const button = fixture.nativeElement.querySelector('.edit-button');
    button.click();
    expect(component.editProfilePicture).toHaveBeenCalled();
  });
});
