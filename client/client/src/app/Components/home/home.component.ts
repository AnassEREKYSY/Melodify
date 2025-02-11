import { Component } from '@angular/core';
import { PlaylistsListComponent } from "../playlists-list/playlists-list.component";
import { ArtistsListComponent } from "../artists-list/artists-list.component";

@Component({
  selector: 'app-home',
  imports: [PlaylistsListComponent, ArtistsListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
