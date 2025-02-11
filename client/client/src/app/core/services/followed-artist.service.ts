import { Injectable } from '@angular/core';
import { environment } from '../../../environments/envirnoment.developement';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FollowedArtist } from '../models/FollowedArtist.model';

@Injectable({
  providedIn: 'root'
})
export class FollowedArtistService {

  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getFollowedArtist(): Observable<FollowedArtist[]> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<FollowedArtist[]>(`${this.apiUrl}users/followed-artists`, { headers });
  }
}
