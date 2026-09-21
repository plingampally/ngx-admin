import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { NB_DOCUMENT } from '@nebular/theme';

import { SeoService } from './seo.service';

describe('SeoService', () => {
  let events: Subject<any>;

  function createService(platformId: string): SeoService {
    TestBed.configureTestingModule({
      providers: [
        SeoService,
        { provide: Router, useValue: { events } },
        { provide: NB_DOCUMENT, useValue: document },
        { provide: PLATFORM_ID, useValue: platformId },
      ],
    });
    return TestBed.inject(SeoService);
  }

  function canonicalLinks(): NodeListOf<HTMLLinkElement> {
    return document.head.querySelectorAll('link[rel="canonical"]');
  }

  beforeEach(() => {
    events = new Subject<any>();
  });

  afterEach(() => {
    canonicalLinks().forEach(link => link.remove());
  });

  it('should create a canonical link on construction in browser', () => {
    const before = canonicalLinks().length;
    createService('browser');
    const links = canonicalLinks();
    expect(links.length).toBe(before + 1);
    expect(links[links.length - 1].getAttribute('href'))
      .toBe(document.location.origin + document.location.pathname);
  });

  it('should update canonical href on NavigationEnd', () => {
    const service = createService('browser');
    const link = canonicalLinks()[canonicalLinks().length - 1];
    const setAttributeSpy = spyOn(link, 'setAttribute').and.callThrough();

    service.trackCanonicalChanges();
    events.next(new NavigationEnd(1, '/pages/dashboard', '/pages/dashboard'));

    expect(setAttributeSpy).toHaveBeenCalledWith(
      'href',
      document.location.origin + document.location.pathname,
    );
  });

  it('should not create a canonical link on server platform', () => {
    const before = canonicalLinks().length;
    createService('server');
    expect(canonicalLinks().length).toBe(before);
  });
});
