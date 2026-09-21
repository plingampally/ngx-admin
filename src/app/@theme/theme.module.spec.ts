import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
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
          HttpClientTestingModule,
        ],
      });
      themeService = TestBed.inject(NbThemeService);
    });

    it('should resolve NbThemeService with default theme', () => {
      expect(themeService).toBeTruthy();
      expect(themeService.currentTheme).toBe('default');
    });

    it('changeTheme should switch to cosmic', () => {
      themeService.changeTheme('cosmic');
      expect(themeService.currentTheme).toBe('cosmic');
    });
  });
});
