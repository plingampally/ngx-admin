import { Component, OnDestroy } from '@angular/core';
import { takeWhile } from 'rxjs/operators';
import { BankingOpsData, RiskAlert } from '../../../@core/data/banking-ops';

@Component({
  selector: 'ngx-risk-alerts',
  styleUrls: ['./risk-alerts.component.scss'],
  templateUrl: './risk-alerts.component.html',
})
export class RiskAlertsComponent implements OnDestroy {

  private alive = true;

  alerts: RiskAlert[] = [];
  filter = 'all';
  filters = ['all', 'critical', 'high', 'medium', 'low'];

  constructor(private bankingOps: BankingOpsData) {
    this.bankingOps.getRiskAlerts()
      .pipe(takeWhile(() => this.alive))
      .subscribe(alerts => this.alerts = alerts);
  }

  get visibleAlerts(): RiskAlert[] {
    return this.filter === 'all' ? this.alerts : this.alerts.filter(a => a.severity === this.filter);
  }

  get openCount(): number {
    return this.alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;
  }

  statusFor(severity: RiskAlert['severity']): string {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'basic';
    }
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
