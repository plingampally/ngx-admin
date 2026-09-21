import { TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let events: Subject<any>;
  let gaSpy: jasmine.Spy;

  beforeEach(() => {
    events = new Subject<any>();
    gaSpy = jasmine.createSpy('ga');
    (window as any).ga = gaSpy;

    TestBed.configureTestingModule({
      providers: [
        AnalyticsService,
        { provide: Router, useValue: { events } },
        { provide: Location, useValue: { path: () => '/pages/dashboard' } },
      ],
    });
    service = TestBed.inject(AnalyticsService);
  });

  afterEach(() => {
    delete (window as any).ga;
  });

  it('should not track page views when disabled', () => {
    service.trackPageViews();
    events.next(new NavigationEnd(1, '/a', '/a'));
    expect(gaSpy).not.toHaveBeenCalled();
  });

  it('should not track events when disabled', () => {
    service.trackEvent('x');
    expect(gaSpy).not.toHaveBeenCalled();
  });

  it('should ignore non-NavigationEnd events when enabled', () => {
    (service as any).enabled = true;
    service.trackPageViews();
    events.next(new NavigationStart(1, '/a'));
    expect(gaSpy).not.toHaveBeenCalled();
  });

  it('should track page view on NavigationEnd when enabled', () => {
    (service as any).enabled = true;
    service.trackPageViews();
    events.next(new NavigationEnd(1, '/a', '/a'));
    expect(gaSpy).toHaveBeenCalledTimes(1);
    expect(gaSpy).toHaveBeenCalledWith('send', {
      hitType: 'pageview',
      page: '/pages/dashboard',
    });
  });

  it('should track events when enabled', () => {
    (service as any).enabled = true;
    service.trackEvent('login');
    expect(gaSpy).toHaveBeenCalledWith('send', 'event', 'login');
  });
});
