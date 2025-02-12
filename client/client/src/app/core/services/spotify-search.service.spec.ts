import { TestBed } from '@angular/core/testing';

import { SpotifySearchService } from './spotify-search.service';

describe('SpotifySearchService', () => {
  let service: SpotifySearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotifySearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
