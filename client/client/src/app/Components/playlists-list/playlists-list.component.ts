import { Component, OnInit } from '@angular/core';
import { Playlist } from '../../core/models/Playlist.model';
import { PlaylistService } from '../../core/services/playlist.service';
import { SpotifyPaginatedPlaylists } from '../../core/models/SpotifyPaginatedPlaylists.model';
import { PlaylistComponent } from "./playlist/playlist.component";
import { CommonModule } from '@angular/common';
import { SnackBarService } from '../../core/services/snack-bar.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CreatePlaylist } from '../../core/Dtos/CreatePlaylist.dto';
import { UserService } from '../../core/services/user.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@Component({
  selector: 'app-playlists-list',
  imports: [
    PlaylistComponent,
    CommonModule,
    ReactiveFormsModule,
    InfiniteScrollModule,
  ],
  templateUrl: './playlists-list.component.html',
  styleUrl: './playlists-list.component.scss'
})
export class PlaylistsListComponent implements OnInit{
  playlists: Playlist[] = [];
  showCreateForm = false;
  createPlaylistForm: FormGroup;
  userId: string = "";

  totalPlaylists: number = 0;
  limit: number = 8; 
  offset: number = 0;

  Math = Math; 
  
  isLoading: boolean = true; 
  isLoadingNewData: boolean = false; 
  scrollDistance = 1;
  scrollUpDistance = 2;

  constructor(
    private playlistService: PlaylistService,
    private snackBarService: SnackBarService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.createPlaylistForm = this.fb.group({
      name: [''],
      description: [''],
      isPublic: [true],
    });
  }

  ngOnInit(): void {
    this.fetchPlaylists();
    this.userService.extractUserIdFromToken().subscribe({ next: (id) => { this.userId = id} });
  }

  fetchPlaylists(): void {
    this.isLoadingNewData = true;
    this.playlistService.getSpotifyPlaylistsByUserId(this.offset, this.limit)
      .subscribe({
        next: (response: SpotifyPaginatedPlaylists) => {
          this.playlists = [...this.playlists, ...response.playlists];
          this.totalPlaylists = response.total;
          this.isLoading = false; 
          this.isLoadingNewData = false; 
        },
        error: (error) => {
          console.error('Error fetching playlists:', error);
          this.isLoading = false;
          this.isLoadingNewData = false;
        }
      });
  }

  loadMore(): void {
    if (this.offset + this.limit < this.totalPlaylists && !this.isLoading) {
      this.offset += this.limit;
      this.isLoadingNewData = true; 
      this.fetchPlaylists();
    }
  }

  deletePlaylist(id: string) {
    this.playlistService.deletePlaylist(id).subscribe({
      next: () => {
        this.snackBarService.success("Playlist deleted successfully");
        this.playlists = this.playlists.filter(playlist => playlist.id !== id);
      },
      error: (error) => {
        console.error('Error deleting playlist:', error);
        this.snackBarService.error('Error deleting playlist: ' + error);
      }
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }

  setVisibility(isPublic: boolean): void {
    this.createPlaylistForm.patchValue({ isPublic });
  }

  createPlaylist(event: Event): void {
    event.preventDefault();
    const newPlaylist: CreatePlaylist = {
      name: this.createPlaylistForm.value.name,
      userId: this.userId,
      isPublic: this.createPlaylistForm.value.isPublic,
      description: this.createPlaylistForm.value.description
    };

    this.playlistService.createPlaylist(newPlaylist).subscribe({
      next: (response) => {
        this.snackBarService.success("Playlist created successfully");
        this.toggleCreateForm();
        this.createPlaylistForm.reset();
        this.playlists = [response, ...this.playlists]; 
        this.totalPlaylists++;
      },
      error: (error) => {
        this.snackBarService.error('Error creating playlist: ' + error);
      }
    });
  }
}


