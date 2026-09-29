import {Component, OnDestroy} from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators' ;
import { SolarData } from '../../@core/data/solar';

interface CardSettings {
  title: string;
  iconClass: string;
  type: string;
}

@Component({
  selector: 'ngx-dashboard',
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnDestroy {

  private alive = true;

  solarValue: number;
  onlineBankingCard: CardSettings = {
    title: 'Online Banking',
    iconClass: 'nb-locked',
    type: 'primary',
  };
  cardNetworkCard: CardSettings = {
    title: 'Card Network',
    iconClass: 'nb-e-commerce',
    type: 'success',
  };
  wireTransfersCard: CardSettings = {
    title: 'Wire Transfers',
    iconClass: 'nb-paper-plane',
    type: 'info',
  };
  atmNetworkCard: CardSettings = {
    title: 'ATM Network',
    iconClass: 'nb-keypad',
    type: 'warning',
  };

  statusCards: CardSettings[];

  commonStatusCardsSet: CardSettings[] = [
    this.onlineBankingCard,
    this.cardNetworkCard,
    this.wireTransfersCard,
    this.atmNetworkCard,
  ];

  statusCardsByThemes: {
    default: CardSettings[];
    cosmic: CardSettings[];
    corporate: CardSettings[];
    dark: CardSettings[];
    bofa: CardSettings[];
  } = {
    default: this.commonStatusCardsSet,
    cosmic: this.commonStatusCardsSet,
    corporate: [
      {
        ...this.onlineBankingCard,
        type: 'warning',
      },
      {
        ...this.cardNetworkCard,
        type: 'primary',
      },
      {
        ...this.wireTransfersCard,
        type: 'danger',
      },
      {
        ...this.atmNetworkCard,
        type: 'info',
      },
    ],
    dark: this.commonStatusCardsSet,
    bofa: [
      {
        ...this.onlineBankingCard,
        type: 'primary',
      },
      {
        ...this.cardNetworkCard,
        type: 'danger',
      },
      {
        ...this.wireTransfersCard,
        type: 'info',
      },
      {
        ...this.atmNetworkCard,
        type: 'success',
      },
    ],
  };

  constructor(private themeService: NbThemeService,
              private solarService: SolarData) {
    this.themeService.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe(theme => {
        this.statusCards = this.statusCardsByThemes[theme.name] || this.commonStatusCardsSet;
    });

    this.solarService.getSolarData()
      .pipe(takeWhile(() => this.alive))
      .subscribe((data) => {
        this.solarValue = data;
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
