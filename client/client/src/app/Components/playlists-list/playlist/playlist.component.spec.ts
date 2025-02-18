import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlaylistComponent } from './playlist.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { Playlist } from '../../../core/models/Playlist.model';

describe('PlaylistComponent', () => {
  let component: PlaylistComponent;
  let fixture: ComponentFixture<PlaylistComponent>;

  const mockPlaylist: Playlist = {
    id: '123',
    name: 'Test Playlist',
    description: 'A test playlist description',
    userId: 'user123',
    isPublic: true,
    externalUrl: 'https://example.com/playlist',
    imageUrls: ['https://example.com/playlist.jpg'],
    ownerDisplayName: 'Test User',
    ownerUri: 'https://example.com/user',
    snapshotId: 'snapshot_123',
    songs: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatIconModule, PlaylistComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaylistComponent);
    component = fixture.componentInstance;
    component.playlist = mockPlaylist;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the playlist name and owner', () => {
    const title = fixture.debugElement.query(By.css('.playlist-title')).nativeElement;
    const artist = fixture.debugElement.query(By.css('.playlist-artist')).nativeElement;

    expect(title.textContent).toContain(mockPlaylist.name);
    expect(artist.textContent).toContain(`by ${mockPlaylist.ownerDisplayName}`);
  });

  it('should display the playlist cover image', () => {
    const image = fixture.debugElement.query(By.css('.playlist-image')).nativeElement;
    expect(image.src).toBe(mockPlaylist.imageUrls[0]);
  });

  it('should call goToDetails when the playlist card is clicked', () => {
    spyOn(component, 'goToDetails');

    const card = fixture.debugElement.query(By.css('.playlist-card'));
    card.triggerEventHandler('click', null);

    expect(component.goToDetails).toHaveBeenCalledWith(mockPlaylist.id);
  });

  it('should call deletePlaylist when delete button is clicked and stop event propagation', () => {
    spyOn(component, 'deletePlaylist');

    const event = jasmine.createSpyObj('event', ['stopPropagation']);

    const deleteButton = fixture.debugElement.query(By.css('.delete-btn'));
    deleteButton.triggerEventHandler('click', event);

    expect(component.deletePlaylist).toHaveBeenCalledWith(mockPlaylist.id);
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should display a placeholder if no image is available', () => {
    component.playlist = { ...mockPlaylist, imageUrls: [] }; // Ensure playlist is assigned before modifying
    fixture.detectChanges();

    const placeholder = fixture.debugElement.query(By.css('.playlist-image.no-image'));
    expect(placeholder).toBeTruthy();
  });
});
