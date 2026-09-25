import { Component, Input } from '@angular/core';
import { NbSortDirection, NbSortRequest, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';

interface TreeNode<T> {
  data: T;
  children?: TreeNode<T>[];
  expanded?: boolean;
}

interface PortfolioEntry {
  portfolio: string;
  balance: string;
  kind: string;
  accounts?: number;
}

@Component({
  selector: 'ngx-tree-grid',
  templateUrl: './tree-grid.component.html',
  styleUrls: ['./tree-grid.component.scss'],
})
export class TreeGridComponent {
  customColumn = 'portfolio';
  defaultColumns = [ 'balance', 'kind', 'accounts' ];
  allColumns = [ this.customColumn, ...this.defaultColumns ];

  dataSource: NbTreeGridDataSource<PortfolioEntry>;

  sortColumn: string;
  sortDirection: NbSortDirection = NbSortDirection.NONE;

  constructor(private dataSourceBuilder: NbTreeGridDataSourceBuilder<PortfolioEntry>) {
    this.dataSource = this.dataSourceBuilder.create(this.data);
  }

  updateSort(sortRequest: NbSortRequest): void {
    this.sortColumn = sortRequest.column;
    this.sortDirection = sortRequest.direction;
  }

  getSortDirection(column: string): NbSortDirection {
    if (this.sortColumn === column) {
      return this.sortDirection;
    }
    return NbSortDirection.NONE;
  }

  private data: TreeNode<PortfolioEntry>[] = [
    {
      data: { portfolio: 'Consumer Lending', balance: '$412.6B', accounts: 4, kind: 'segment' },
      children: [
        { data: { portfolio: 'Residential mortgage', kind: 'secured', balance: '$228.4B' } },
        { data: { portfolio: 'Home equity', kind: 'secured', balance: '$25.1B' } },
        { data: { portfolio: 'Credit card', kind: 'revolving', balance: '$101.3B' } },
        { data: { portfolio: 'Auto & other consumer', kind: 'secured', balance: '$57.8B' } },
      ],
    },
    {
      data: { portfolio: 'Commercial Lending', kind: 'segment', balance: '$596.9B', accounts: 3 },
      children: [
        { data: { portfolio: 'U.S. commercial', kind: 'term', balance: '$372.2B' } },
        { data: { portfolio: 'Non-U.S. commercial', kind: 'term', balance: '$128.5B' } },
        { data: { portfolio: 'Commercial real estate', kind: 'secured', balance: '$96.2B' } },
      ],
    },
    {
      data: { portfolio: 'Small Business', kind: 'segment', balance: '$44.7B', accounts: 2 },
      children: [
        { data: { portfolio: 'Business lines of credit', kind: 'revolving', balance: '$27.9B' } },
        { data: { portfolio: 'Equipment finance', kind: 'term', balance: '$16.8B' } },
      ],
    },
  ];

  getShowOn(index: number) {
    const minWithForMultipleColumns = 400;
    const nextColumnStep = 100;
    return minWithForMultipleColumns + (nextColumnStep * index);
  }
}

@Component({
  selector: 'ngx-fs-icon',
  template: `
    <nb-tree-grid-row-toggle [expanded]="expanded" *ngIf="isDir(); else fileIcon">
    </nb-tree-grid-row-toggle>
    <ng-template #fileIcon>
      <nb-icon icon="file-text-outline"></nb-icon>
    </ng-template>
  `,
})
export class FsIconComponent {
  @Input() kind: string;
  @Input() expanded: boolean;

  isDir(): boolean {
    return this.kind === 'segment';
  }
}
