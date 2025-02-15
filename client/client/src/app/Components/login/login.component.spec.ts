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
  let mockActivatedRoute: ActivatedRoute;

  beforeEach(async () => {
    mockLoginService = jasmine.createSpyObj('LoginService', ['getLoginUrl', 'handleCallback']);
    mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['success']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockActivatedRoute = {
      queryParams: of({ code: 'sampleCode', state: 'sampleState' })
    } as any; 
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: LoginService, useValue: mockLoginService },
        { provide: SnackBarService, useValue: mockSnackBarService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
