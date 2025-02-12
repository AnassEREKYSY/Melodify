import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/envirnoment.developement';
import { combineLatest } from 'rxjs'; 

@Injectable({
  providedIn: 'root'
})
export class SpotifySearchService {

  private apiUrl = environment.apiUrl;
  private searchSubject = new BehaviorSubject<string>('');
  private filterSubject = new BehaviorSubject<string>('all');  

  constructor(private http: HttpClient) {}

  search(query: string, type: string, offset: number = 0, limit: number = 10): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  
    return this.http.get<any>(`${this.apiUrl}search/spotify-search?query=${query}&type=${type}&offset=${offset}&limit=${limit}`, { headers });
  }

  getSearchResults(): Observable<any> {
    return combineLatest([this.searchSubject, this.filterSubject]).pipe(  
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(([query, filterType]) => this.search(query, filterType))  
    );
  }

  updateSearchQuery(query: string): void {
    this.searchSubject.next(query);
  }

  setFilterType(type: string): void {
    this.filterSubject.next(type);  
  }
}
