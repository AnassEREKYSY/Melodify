import { Component, OnInit } from '@angular/core';
import { UserProfileService } from '../../core/services/user-profile.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { SpotifyUserProfile } from '../../core/models/SpotifyUserProfile.model';

@Component({
  selector: 'app-user-profil',
  imports: [
    MatCardModule,
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './user-profil.component.html',
  styleUrl: './user-profil.component.scss'
})
export class UserProfilComponent implements OnInit {
  userProfile: SpotifyUserProfile | undefined;
  errorMessage: string | undefined;

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit(): void {
    this.userProfileService.getUserProfile().subscribe(
      (profile) => {
        console.log(profile)
        this.userProfile = profile;
      },
      (error) => {
        this.errorMessage = 'Failed to load user profile.';
        console.error(error);
      }
    );
  }

  viewProfile(): void {
    if (this.userProfile?.external_urls?.spotify) {
      window.open(this.userProfile.external_urls.spotify, '_blank');
    }
  }

  editProfilePicture(): void {
    console.log("Edit profile picture clicked!");
    // You can trigger a file input, open a modal, or navigate to an edit page here.
  }
}
