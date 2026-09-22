import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { CDK_TABLE } from '@angular/cdk/table';

import { NbCardModule, NbIconModule, NbInputModule, NbThemeModule, NbTreeGridComponent, NbTreeGridModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

import { FsIconComponent, TreeGridComponent } from './tree-grid.component';

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
    configureTestingModule([TreeGridComponent, FsIconComponent]);
    fixture = TestBed.createComponent(TreeGridComponent);
  });

  it('renders header and data rows without throwing', () => {
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tr[nbtreegridrow]');
    expect(rows.length).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelector('tr[nbtreegridheaderrow]')).not.toBeNull();
  });

  it('NbTreeGrid provides CDK_TABLE itself (Nebular 14, no app-side shim needed)', () => {
    fixture.detectChanges();
    const grid = fixture.debugElement.query(By.directive(NbTreeGridComponent));
    expect(grid).not.toBeNull();
    expect(grid.injector.get(CDK_TABLE)).toBe(grid.componentInstance);
  });
});
