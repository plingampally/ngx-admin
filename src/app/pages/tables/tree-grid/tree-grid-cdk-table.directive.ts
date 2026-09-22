import { Directive, forwardRef } from '@angular/core';
import { CDK_TABLE } from '@angular/cdk/table';
import { NbTreeGridComponent } from '@nebular/theme';

// @angular/cdk 17.1+ row outlets inject CDK_TABLE non-optionally, but Nebular 13's
// NbTreeGridComponent replaces CdkTable's providers and no longer exposes it.
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector -- must match Nebular's nbTreeGrid element
  selector: 'table[nbTreeGrid]',
  providers: [{ provide: CDK_TABLE, useExisting: forwardRef(() => NbTreeGridComponent) }],
})
export class TreeGridCdkTableDirective { }
