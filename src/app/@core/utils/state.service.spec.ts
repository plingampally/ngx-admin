import { TestBed } from '@angular/core/testing';

import {
  NB_DOCUMENT,
  NB_LAYOUT_DIRECTION,
  NbLayoutDirection,
  NbLayoutDirectionService,
} from '@nebular/theme';

import { StateService } from './state.service';

describe('StateService', () => {
  let service: StateService;
  let directionService: NbLayoutDirectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StateService,
        NbLayoutDirectionService,
        { provide: NB_DOCUMENT, useValue: document },
        { provide: NB_LAYOUT_DIRECTION, useValue: NbLayoutDirection.LTR },
      ],
    });
    service = TestBed.inject(StateService);
    directionService = TestBed.inject(NbLayoutDirectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getLayoutStates should emit 3 layouts with one-column selected', (done) => {
    service.getLayoutStates().subscribe(layouts => {
      expect(layouts.length).toBe(3);
      expect(layouts.find(layout => layout.selected).id).toBe('one-column');
      done();
    });
  });

  it('onLayoutState should emit current layout and react to setLayoutState', (done) => {
    const emitted: any[] = [];
    service.onLayoutState().subscribe(layout => emitted.push(layout));

    service.getLayoutStates().subscribe(layouts => {
      service.setLayoutState(layouts[1]);

      expect(emitted.length).toBe(2);
      expect(emitted[0].id).toBe('one-column');
      expect(emitted[1].id).toBe('two-column');
      done();
    });
  });

  it('getSidebarStates should emit 2 sidebars with LTR start icon', (done) => {
    service.getSidebarStates().subscribe(sidebars => {
      expect(sidebars.length).toBe(2);
      expect(sidebars[0].icon).toBe('nb-layout-sidebar-left');
      done();
    });
  });

  it('should swap start sidebar icon when direction changes to RTL', (done) => {
    directionService.setDirection(NbLayoutDirection.RTL);

    service.getSidebarStates().subscribe(sidebars => {
      expect(sidebars[0].icon).toBe('nb-layout-sidebar-right');
      done();
    });
  });
});
