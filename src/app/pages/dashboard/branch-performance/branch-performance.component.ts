import { Component, OnDestroy } from '@angular/core';
import { takeWhile } from 'rxjs/operators';
import { BankingOpsData, BranchPerformance } from '../../../@core/data/banking-ops';

@Component({
  selector: 'ngx-branch-performance',
  styleUrls: ['./branch-performance.component.scss'],
  templateUrl: './branch-performance.component.html',
})
export class BranchPerformanceComponent implements OnDestroy {

  private alive = true;

  branches: BranchPerformance[] = [];

  constructor(private bankingOps: BankingOpsData) {
    this.bankingOps.getBranchPerformance()
      .pipe(takeWhile(() => this.alive))
      .subscribe(branches => this.branches = branches);
  }

  get totalDeposits(): number {
    return this.branches.reduce((sum, b) => sum + b.deposits, 0);
  }

  get totalNewAccounts(): number {
    return this.branches.reduce((sum, b) => sum + b.newAccounts, 0);
  }

  statusFor(status: BranchPerformance['status']): string {
    switch (status) {
      case 'open': return 'success';
      case 'limited': return 'warning';
      default: return 'danger';
    }
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
