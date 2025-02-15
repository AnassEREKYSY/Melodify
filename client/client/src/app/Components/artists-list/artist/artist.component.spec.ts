import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArtistComponent } from './artist.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { FollowedArtist } from '../../../core/models/FollowedArtist.model';

describe('ArtistComponent', () => {
  let component: ArtistComponent;
  let fixture: ComponentFixture<ArtistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatIconModule,ArtistComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtistComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
