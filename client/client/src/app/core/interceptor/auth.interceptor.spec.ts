import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthInterceptor } from './auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
      ],
    });

    interceptor = TestBed.inject(AuthInterceptor);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should add Authorization header when accessToken is available', () => {
    localStorage.setItem('accessToken', 'test-token');
    const request = { url: '/test' };

    // Perform the HTTP request and assert that the Authorization header is added
    TestBed.inject(HttpTestingController).expectOne('/test').flush({}, { status: 200, statusText: 'OK' });

    const httpRequest = httpTestingController.expectOne('/test');
    expect(httpRequest.request.headers.has('Authorization')).toBeTrue();
    expect(httpRequest.request.headers.get('Authorization')).toBe('Bearer test-token');
    httpTestingController.verify();
  });

  it('should not add Authorization header when accessToken is not available', () => {
    localStorage.removeItem('accessToken');
    const request = { url: '/test' };

    // Perform the HTTP request and ensure that no Authorization header is added
    TestBed.inject(HttpTestingController).expectOne('/test').flush({}, { status: 200, statusText: 'OK' });

    const httpRequest = httpTestingController.expectOne('/test');
    expect(httpRequest.request.headers.has('Authorization')).toBeFalse();
    httpTestingController.verify();
  });
});
