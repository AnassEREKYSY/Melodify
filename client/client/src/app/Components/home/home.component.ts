import { Component } from '@angular/core';
import { PlaylistsListComponent } from "../playlists-list/playlists-list.component";

@Component({
  selector: 'app-home',
  imports: [PlaylistsListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
