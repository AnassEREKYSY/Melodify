import { Component, OnInit } from '@angular/core';
import { UserProfileService } from '../../core/services/user-profile.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profil',
  imports: [
    MatCardModule,
    CommonModule,
  ],
  templateUrl: './user-profil.component.html',
  styleUrl: './user-profil.component.scss'
})
export class UserProfilComponent implements OnInit {
  userProfile: any;
  errorMessage: string | undefined;

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit(): void {
    this.userProfileService.getUserProfile().subscribe(
      (profile) => {
        this.userProfile = profile;
      },
      (error) => {
        this.errorMessage = 'Failed to load user profile.';
        console.error(error);
      }
    );
  }
}
