import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { debounceTime, distinctUntilChanged, Observable, Subject, switchMap } from 'rxjs';
import { environment } from '../../../environments/envirnoment.developement';

@Injectable({
  providedIn: 'root'
})
export class SpotifySearchService {

  private apiUrl = environment.apiUrl;
  private searchSubject = new Subject<string>();
  constructor(private http: HttpClient) {}

  search(query: string, offset: number = 0, limit: number = 10): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any>(`${this.apiUrl}search/spotify-search?query=${query}&limit=${limit}`, { headers });
  }

  getSearchResults(): Observable<any> {
    return this.searchSubject.pipe(
      debounceTime(300), 
      distinctUntilChanged(), 
      switchMap(query => this.search(query))
    );
  }

  updateSearchQuery(query: string): void {
    this.searchSubject.next(query);
  }
}
