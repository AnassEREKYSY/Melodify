import { Injectable } from '@angular/core';
import { environment } from '../../../environments/envirnoment.developement';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { SpotifyUserProfile } from '../models/SpotifyUserProfile.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  extractUserIdFromToken(): Observable<string> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    
    return this.http.get<SpotifyUserProfile>(`${this.apiUrl}users/spotify/me`, { headers })
      .pipe(
        map((profile: SpotifyUserProfile) => profile.id)
      );
  }
}
