import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { NbThemeService } from '@nebular/theme';

import { ThemeModule } from './theme.module';

describe('ThemeModule', () => {
  it('forRoot should return ThemeModule', () => {
    const moduleWithProviders = ThemeModule.forRoot();
    expect(moduleWithProviders.ngModule).toBe(ThemeModule);
  });

  describe('providers', () => {
    let themeService: NbThemeService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          ThemeModule.forRoot(),
          RouterTestingModule,
          NoopAnimationsModule,
        ],
        providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
      });
      themeService = TestBed.inject(NbThemeService);
    });

    it('should resolve NbThemeService with the Bank of America theme active', () => {
      expect(themeService).toBeTruthy();
      expect(themeService.currentTheme).toBe('bofa');
    });

    it('bofa JS theme exposes the brand palette as primary/danger', () => {
      themeService.changeTheme('bofa');
      themeService.getJsTheme().subscribe(theme => {
        expect(theme.variables.primary).toBe('#012169');
        expect(theme.variables.danger).toBe('#e31837');
      });
    });

    it('changeTheme should switch to cosmic', () => {
      themeService.changeTheme('cosmic');
      expect(themeService.currentTheme).toBe('cosmic');
    });
  });
});
