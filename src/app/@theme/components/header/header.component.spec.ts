import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import {
  NbActionsModule,
  NbContextMenuModule,
  NbIconModule,
  NbLayoutModule,
  NbMenuModule,
  NbSearchModule,
  NbSelectModule,
  NbSidebarModule,
  NbSidebarService,
  NbThemeModule,
  NbThemeService,
  NbUserModule,
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { NbRoleProvider, NbSecurityModule } from '@nebular/security';

import { HeaderComponent } from './header.component';
import { UserData } from '../../../@core/data/users';
import { LayoutService } from '../../../@core/utils';

@Component({
  template: `
    <nb-layout>
      <nb-layout-header>
        <ngx-header></ngx-header>
      </nb-layout-header>
    </nb-layout>
  `,
})
class TestHostComponent {
}

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: HeaderComponent;
  let themeService: NbThemeService;
  let sidebarService: NbSidebarService;
  let layoutService: LayoutService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent, TestHostComponent],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule,
        NbThemeModule.forRoot({ name: 'default' }),
        NbLayoutModule,
        NbSelectModule,
        NbActionsModule,
        NbUserModule,
        NbSearchModule,
        NbContextMenuModule,
        NbIconModule,
        NbEvaIconsModule,
        NbMenuModule.forRoot(),
        NbSidebarModule.forRoot(),
        NbSecurityModule.forRoot({
          accessControl: {
            guest: {
              view: '*',
            },
          },
        }),
      ],
      providers: [
        LayoutService,
        {
          provide: UserData,
          useValue: {
            getUsers: () => of({ nick: { name: 'Nick Jones', picture: 'x.png' } }),
          },
        },
        { provide: NbRoleProvider, useValue: { getRole: () => of('guest') } },
      ],
    }).compileComponents();

    themeService = TestBed.inject(NbThemeService);
    sidebarService = TestBed.inject(NbSidebarService);
    layoutService = TestBed.inject(LayoutService);

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    component = fixture.debugElement
      .query(By.directive(HeaderComponent)).componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have 4 themes', () => {
    expect(component.themes.length).toBe(4);
    expect(component.themes.map(theme => theme.value))
      .toEqual(['default', 'dark', 'cosmic', 'corporate']);
  });

  it('should initialise currentTheme to default', () => {
    expect(component.currentTheme).toBe('default');
  });

  it('changeTheme should call NbThemeService.changeTheme and update currentTheme', () => {
    const changeThemeSpy = spyOn(themeService, 'changeTheme').and.callThrough();
    component.changeTheme('dark');
    expect(changeThemeSpy).toHaveBeenCalledWith('dark');
    fixture.detectChanges();
    expect(component.currentTheme).toBe('dark');
  });

  it('should set user to Nick Jones on init', () => {
    expect(component.user).toBeTruthy();
    expect(component.user.name).toBe('Nick Jones');
  });

  it('toggleSidebar should toggle menu-sidebar and trigger layout change', () => {
    const toggleSpy = spyOn(sidebarService, 'toggle');
    const layoutSpy = spyOn(layoutService, 'changeLayoutSize');
    component.toggleSidebar();
    expect(toggleSpy).toHaveBeenCalledWith(true, 'menu-sidebar');
    expect(layoutSpy).toHaveBeenCalled();
  });
});
