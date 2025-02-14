import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { LoginService } from '../../core/services/login.service';
import { SnackBarService } from '../../core/services/snack-bar.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockLoginService: jasmine.SpyObj<LoginService>;
  let mockSnackBarService: jasmine.SpyObj<SnackBarService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    // Create spies for services
    mockLoginService = jasmine.createSpyObj('LoginService', ['getLoginUrl', 'handleCallback']);
    mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['success', 'error']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', ['queryParams']);
    mockActivatedRoute.queryParams = of({ code: 'sampleCode', state: 'sampleState' });

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: LoginService, useValue: mockLoginService },
        { provide: SnackBarService, useValue: mockSnackBarService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loginWithSpotify and redirect to the login URL', () => {
    const authUrl = 'https://spotify.com/login';
    mockLoginService.getLoginUrl.and.returnValue(of(authUrl));

    component.loginWithSpotify();

    expect(mockLoginService.getLoginUrl).toHaveBeenCalled();
    expect(window.location.href).toBe(authUrl);
  });

  it('should handle the Spotify callback successfully via ngOnInit', () => {
    const response = { userProfile: { accessToken: 'some-token' } };
    mockLoginService.handleCallback.and.returnValue(of(response));
    spyOn(localStorage, 'setItem');
    spyOn(mockRouter, 'navigate');
    spyOn(mockSnackBarService, 'success');
  
    // Simulate query parameters
    component.ngOnInit();
    fixture.detectChanges();  // Trigger change detection
  
    expect(mockLoginService.handleCallback).toHaveBeenCalledWith('sampleCode', 'sampleState');
    expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'some-token');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    expect(mockSnackBarService.success).toHaveBeenCalledWith("You're logged successfully");
  });
});
