import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { LayoutService } from './layout.service';

describe('LayoutService', () => {
  let service: LayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LayoutService],
    });
    service = TestBed.inject(LayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('onChangeLayoutSize should emit after changeLayoutSize', fakeAsync(() => {
    const spy = jasmine.createSpy('onChangeLayoutSize');
    service.onChangeLayoutSize().subscribe(spy);

    service.changeLayoutSize();
    tick(1);

    expect(spy).toHaveBeenCalled();
  }));

  it('onSafeChangeLayoutSize should debounce rapid changes', fakeAsync(() => {
    const spy = jasmine.createSpy('onSafeChangeLayoutSize');
    service.onSafeChangeLayoutSize().subscribe(spy);

    service.changeLayoutSize();
    service.changeLayoutSize();
    service.changeLayoutSize();
    tick(350);

    expect(spy).toHaveBeenCalledTimes(1);
  }));
});
