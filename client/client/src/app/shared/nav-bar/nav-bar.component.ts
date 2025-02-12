import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { SpotifySearchService } from '../../core/services/spotify-search.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  imports: [
    MatIconModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class NavBarComponent implements OnInit {
  searchQuery: string = '';
  searchResults: any[] = [];
  constructor(private router: Router, private spotifySearchService: SpotifySearchService) {}
  
  ngOnInit(): void {

    this.spotifySearchService.getSearchResults().subscribe({
      next: (response) => {
        this.searchResults = response.tracks?.items || [];
      },
      error: (err) => {
        console.error('Search error:', err);
        this.searchResults = [];
      }
    });
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(){
    localStorage.removeItem('accessToken');
    this.router.navigate(['/login']);
  }

  onSearchInput(): void {
    if (this.searchQuery.trim().length > 0) {
      this.spotifySearchService.updateSearchQuery(this.searchQuery);
    } else {
      this.searchResults = [];
    }
  }

  selectResult(result: any): void {
    console.log('Selected:', result);
    this.searchResults = []; 
  }

}
