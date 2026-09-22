import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { NbCardModule, NbIconModule, NbInputModule, NbThemeModule, NbTreeGridModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

import { FsIconComponent, TreeGridComponent } from './tree-grid.component';
import { TreeGridCdkTableDirective } from './tree-grid-cdk-table.directive';

function configureTestingModule(declarations: any[]): void {
  TestBed.configureTestingModule({
    imports: [
      NoopAnimationsModule,
      NbThemeModule.forRoot({ name: 'default' }),
      NbTreeGridModule,
      NbCardModule,
      NbIconModule,
      NbInputModule,
      NbEvaIconsModule,
    ],
    declarations: [...declarations],
  });
}

describe('TreeGridComponent', () => {
  let fixture: ComponentFixture<TreeGridComponent>;

  beforeEach(() => {
    configureTestingModule([TreeGridComponent, FsIconComponent, TreeGridCdkTableDirective]);
    fixture = TestBed.createComponent(TreeGridComponent);
  });

  it('renders header and data rows without throwing', () => {
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tr[nbtreegridrow]');
    expect(rows.length).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelector('tr[nbtreegridheaderrow]')).not.toBeNull();
  });
});

describe('TreeGridComponent without TreeGridCdkTableDirective', () => {
  it('fails with a CDK_TABLE NullInjectorError (regression covered by the directive)', () => {
    configureTestingModule([TreeGridComponent, FsIconComponent]);

    let thrown: any;
    try {
      const fixture = TestBed.createComponent(TreeGridComponent);
      fixture.detectChanges();
    } catch (e) {
      thrown = e;
    }

    expect(thrown).toBeTruthy();
    expect(String(thrown && thrown.message)).toContain('CDK_TABLE');
  });
});
