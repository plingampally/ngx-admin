import { Observable } from 'rxjs';

export interface RiskAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  amount: number;
  region: string;
  minutesAgo: number;
}

export interface BranchPerformance {
  branch: string;
  region: string;
  deposits: number;
  newAccounts: number;
  loanOriginations: number;
  nps: number;
  status: 'open' | 'limited' | 'closed';
}

export abstract class BankingOpsData {
  abstract getRiskAlerts(): Observable<RiskAlert[]>;
  abstract getBranchPerformance(): Observable<BranchPerformance[]>;
}
