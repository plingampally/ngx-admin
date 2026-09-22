import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { NB_DOCUMENT } from '@nebular/theme';
import { NbRoleProvider } from '@nebular/security';
import { NbAccessChecker } from '@nebular/security';

import { CoreModule, NB_CORE_PROVIDERS, NbSimpleRoleProvider } from './core.module';

describe('CoreModule', () => {
  it('NbSimpleRoleProvider should emit guest role', (done) => {
    new NbSimpleRoleProvider().getRole().subscribe(role => {
      expect(role).toBe('guest');
      done();
    });
  });

  it('forRoot should return CoreModule with providers', () => {
    const moduleWithProviders = CoreModule.forRoot();
    expect(moduleWithProviders.ngModule).toBe(CoreModule);
    expect(moduleWithProviders.providers.length).toBeGreaterThan(0);
  });

  it('should throw when imported twice', () => {
    expect(() => new CoreModule(new CoreModule(null)))
      .toThrowError(/CoreModule has already been loaded/);
  });
});

describe('NB_CORE_PROVIDERS', () => {
  let accessChecker: NbAccessChecker;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        ...NB_CORE_PROVIDERS,
        { provide: NB_DOCUMENT, useValue: document },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    accessChecker = TestBed.inject(NbAccessChecker);
  });

  it('should provide NbSimpleRoleProvider as NbRoleProvider', () => {
    expect(TestBed.inject(NbRoleProvider) instanceof NbSimpleRoleProvider).toBe(true);
  });

  it('guest role should be granted view:* only', (done) => {
    accessChecker.isGranted('view', 'anything').subscribe(granted => {
      expect(granted).toBe(true);
      done();
    });
  });

  it('guest role should not be granted create', (done) => {
    accessChecker.isGranted('create', 'anything').subscribe(granted => {
      expect(granted).toBe(false);
      done();
    });
  });

  it('guest role should not be granted remove', (done) => {
    accessChecker.isGranted('remove', 'anything').subscribe(granted => {
      expect(granted).toBe(false);
      done();
    });
  });
});
