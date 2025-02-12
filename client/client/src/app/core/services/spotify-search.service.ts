import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/envirnoment.developement';

@Injectable({
  providedIn: 'root'
})
export class SpotifySearchService {

  private apiUrl = environment.apiUrl;
  private searchSubject = new Subject<string>();
  private filterType: string = 'all'; 

  constructor(private http: HttpClient) {}

  search(query: string, type: string, offset: number = 0, limit: number = 10): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  
    return this.http.get<any>(`${this.apiUrl}search/spotify-search?query=${query}&type=${type}&offset=${offset}&limit=${limit}`, { headers });
  }

  getSearchResults(): Observable<any> {
    return this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.search(query, this.filterType))
    );
  }

  updateSearchQuery(query: string): void {
    this.searchSubject.next(query);
  }

  setFilterType(type: string): void {
    this.filterType = type;
  }
}
