import { Injectable } from '@angular/core';
import { of as observableOf, Observable } from 'rxjs';
import { ProgressInfo, StatsProgressBarData } from '../data/stats-progress-bar';

@Injectable()
export class StatsProgressBarService extends StatsProgressBarData {
  private progressInfoData: ProgressInfo[] = [
    {
      title: 'Total Deposits, $M',
      value: 1985400,
      activeProgress: 70,
      description: 'Up vs. prior quarter (70% of target)',
    },
    {
      title: 'New Accounts Opened',
      value: 6378,
      activeProgress: 30,
      description: 'Better than last week (30%)',
    },
    {
      title: 'Fraud Alerts Open',
      value: 200,
      activeProgress: 55,
      description: 'Resolved within SLA (55%)',
    },
  ];

  getProgressInfoData(): Observable<ProgressInfo[]> {
    return observableOf(this.progressInfoData);
  }
}
