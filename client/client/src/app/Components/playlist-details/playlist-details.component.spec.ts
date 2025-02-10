import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistDetailsComponent } from './playlist-details.component';

describe('PlaylistDetailsComponent', () => {
  let component: PlaylistDetailsComponent;
  let fixture: ComponentFixture<PlaylistDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
