import { Injectable } from '@angular/core';
import { of as observableOf, Observable } from 'rxjs';
import { BankingOpsData, BranchPerformance, RiskAlert } from '../data/banking-ops';

@Injectable()
export class BankingOpsService extends BankingOpsData {

  private riskAlerts: RiskAlert[] = [
    {
      id: 'FR-48213', severity: 'critical', category: 'Card fraud',
      description: 'Velocity spike: 14 card-present transactions in 6 minutes across 3 states',
      amount: 18420, region: 'Southeast', minutesAgo: 4,
    },
    {
      id: 'AML-2291', severity: 'high', category: 'AML',
      description: 'Structured cash deposits just under reporting threshold at 2 branches',
      amount: 47800, region: 'Northeast', minutesAgo: 17,
    },
    {
      id: 'WT-90417', severity: 'high', category: 'Wire',
      description: 'Outbound international wire to newly added beneficiary flagged by model',
      amount: 250000, region: 'West', minutesAgo: 26,
    },
    {
      id: 'ATO-1178', severity: 'medium', category: 'Account takeover',
      description: 'Password reset followed by device change and Zelle limit increase',
      amount: 3500, region: 'Midwest', minutesAgo: 41,
    },
    {
      id: 'CHK-6620', severity: 'medium', category: 'Check fraud',
      description: 'Duplicate mobile check deposit detected across two accounts',
      amount: 2150, region: 'Southwest', minutesAgo: 58,
    },
    {
      id: 'OPS-3304', severity: 'low', category: 'Operations',
      description: 'ATM cash-out variance above tolerance at 4 units in Charlotte',
      amount: 1200, region: 'Southeast', minutesAgo: 73,
    },
    {
      id: 'FR-48190', severity: 'low', category: 'Card fraud',
      description: 'Card testing pattern: 22 declined $1 authorizations from one merchant',
      amount: 22, region: 'West', minutesAgo: 95,
    },
  ];

  private branchPerformance: BranchPerformance[] = [
    { branch: 'Charlotte Uptown', region: 'Southeast', deposits: 842.5, newAccounts: 312, loanOriginations: 96.4, nps: 71, status: 'open' },
    { branch: 'New York Bryant Park', region: 'Northeast', deposits: 1210.8, newAccounts: 428, loanOriginations: 142.9, nps: 64, status: 'open' },
    { branch: 'Boston Financial District', region: 'Northeast', deposits: 688.2, newAccounts: 204, loanOriginations: 77.1, nps: 68, status: 'open' },
    { branch: 'Chicago Loop', region: 'Midwest', deposits: 754.9, newAccounts: 261, loanOriginations: 88.3, nps: 62, status: 'limited' },
    { branch: 'Dallas Uptown', region: 'Southwest', deposits: 596.3, newAccounts: 289, loanOriginations: 104.7, nps: 74, status: 'open' },
    { branch: 'Los Angeles Downtown', region: 'West', deposits: 903.6, newAccounts: 337, loanOriginations: 121.2, nps: 59, status: 'open' },
    { branch: 'San Francisco Embarcadero', region: 'West', deposits: 1015.4, newAccounts: 198, loanOriginations: 93.8, nps: 66, status: 'closed' },
    { branch: 'Miami Brickell', region: 'Southeast', deposits: 471.7, newAccounts: 356, loanOriginations: 69.5, nps: 77, status: 'open' },
  ];

  getRiskAlerts(): Observable<RiskAlert[]> {
    return observableOf(this.riskAlerts);
  }

  getBranchPerformance(): Observable<BranchPerformance[]> {
    return observableOf(this.branchPerformance);
  }
}
