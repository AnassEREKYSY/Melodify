import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlaylistComponent } from './playlist.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { Playlist } from '../../../core/models/Playlist.model';

describe('PlaylistComponent', () => {
  let component: PlaylistComponent;
  let fixture: ComponentFixture<PlaylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatIconModule,PlaylistComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaylistComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
