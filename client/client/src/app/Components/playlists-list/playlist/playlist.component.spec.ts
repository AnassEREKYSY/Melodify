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
      imports: [RouterTestingModule, MatIconModule],
      declarations: [PlaylistComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaylistComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display playlist name and owner correctly', () => {
    const mockPlaylist: Playlist = {
      id: '123',
      name: 'My Playlist',
      ownerDisplayName: 'John Doe',
      imageUrls: ['https://example.com/playlist.jpg'],
      description: '',
      userId: '',
      isPublic: false,
      externalUrl: '',
      ownerUri: '',
      snapshotId: '',
      songs: []
    };

    component.playlist = mockPlaylist;
    fixture.detectChanges();

    const titleElement = fixture.debugElement.query(By.css('.playlist-title')).nativeElement;
    const ownerElement = fixture.debugElement.query(By.css('.playlist-artist')).nativeElement;

    expect(titleElement.textContent).toContain('My Playlist');
    expect(ownerElement.textContent).toContain('by John Doe');
  });

  it('should display a placeholder when no image is available', () => {
    const mockPlaylist: Playlist = {
      id: '123',
      name: 'No Image Playlist',
      ownerDisplayName: 'Jane Doe',
      imageUrls: [],
      description: '',
      userId: '',
      isPublic: false,
      externalUrl: '',
      ownerUri: '',
      snapshotId: '',
      songs: []
    };

    component.playlist = mockPlaylist;
    fixture.detectChanges();

    const imageElement = fixture.debugElement.query(By.css('.playlist-image'));
    expect(imageElement).toBeTruthy();
    expect(imageElement.nativeElement.classList).toContain('no-image');
  });

  it('should emit delete event when delete button is clicked', () => {
    spyOn(component.deleteRequest, 'emit');

    const mockPlaylist: Playlist = {
      id: '123',
      name: 'My Playlist',
      ownerDisplayName: 'John Doe',
      imageUrls: ['https://example.com/playlist.jpg'],
      description: '',
      userId: '',
      isPublic: false,
      externalUrl: '',
      ownerUri: '',
      snapshotId: '',
      songs: []
    };

    component.playlist = mockPlaylist;
    fixture.detectChanges();

    const deleteButton = fixture.debugElement.query(By.css('.delete-btn'));
    deleteButton.triggerEventHandler('click', { stopPropagation: () => {} });

    expect(component.deleteRequest.emit).toHaveBeenCalledWith('123');
  });

  it('should navigate to details when clicked', () => {
    const mockPlaylist: Playlist = {
      id: '123',
      name: 'My Playlist',
      ownerDisplayName: 'John Doe',
      imageUrls: ['https://example.com/playlist.jpg'],
      description: '',
      userId: '',
      isPublic: false,
      externalUrl: '',
      ownerUri: '',
      snapshotId: '',
      songs: []
    };

    spyOn(component, 'goToDetails');

    component.playlist = mockPlaylist;
    fixture.detectChanges();

    const playlistCard = fixture.debugElement.query(By.css('.playlist-card'));
    playlistCard.triggerEventHandler('click', null);

    expect(component.goToDetails).toHaveBeenCalledWith('123');
  });
});
