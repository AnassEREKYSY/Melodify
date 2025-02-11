import { TestBed } from '@angular/core/testing';

import { FollowedArtistService } from './followed-artist.service';

describe('FollowedArtistService', () => {
  let service: FollowedArtistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FollowedArtistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
