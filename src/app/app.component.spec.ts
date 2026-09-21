import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { AnalyticsService } from './@core/utils/analytics.service';
import { SeoService } from './@core/utils/seo.service';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let analyticsService: jasmine.SpyObj<AnalyticsService>;
  let seoService: jasmine.SpyObj<SeoService>;

  beforeEach(async () => {
    analyticsService = jasmine.createSpyObj('AnalyticsService', ['trackPageViews']);
    seoService = jasmine.createSpyObj('SeoService', ['trackCanonicalChanges']);

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: AnalyticsService, useValue: analyticsService },
        { provide: SeoService, useValue: seoService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call analytics and seo tracking on init', () => {
    fixture.detectChanges();

    expect(analyticsService.trackPageViews).toHaveBeenCalledTimes(1);
    expect(seoService.trackCanonicalChanges).toHaveBeenCalledTimes(1);
  });
});
