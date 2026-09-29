import { Component, OnDestroy } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { Temperature, TemperatureHumidityData } from '../../../@core/data/temperature-humidity';
import { takeWhile } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'ngx-temperature',
  styleUrls: ['./temperature.component.scss'],
  templateUrl: './temperature.component.html',
})
export class TemperatureComponent implements OnDestroy {

  private alive = true;

  temperatureData: Temperature;
  temperature: number;
  temperatureOff = false;
  temperatureMode = 'base';
  readonly rateScenarios: Record<string, number> = { base: 0, hike: 0.25, cut: -0.25 };

  humidityData: Temperature;
  humidity: number;
  humidityOff = false;
  humidityMode = 'base';
  readonly liquidityScenarios: Record<string, number> = { base: 0, stress: -9, severe: -16 };

  theme: any;
  themeSubscription: any;

  constructor(private themeService: NbThemeService,
              private temperatureHumidityService: TemperatureHumidityData) {
    this.themeService.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe(config => {
      this.theme = config.variables.temperature;
    });

    forkJoin(
      this.temperatureHumidityService.getTemperatureData(),
      this.temperatureHumidityService.getHumidityData(),
    )
      .subscribe(([temperatureData, humidityData]: [Temperature, Temperature]) => {
        this.temperatureData = temperatureData;
        this.temperature = this.temperatureData.value;

        this.humidityData = humidityData;
        this.humidity = this.humidityData.value;
      });
  }

  applyRateScenario(mode: string) {
    this.temperatureMode = mode;
    this.temperature = this.temperatureData.value + this.rateScenarios[mode];
  }

  applyLiquidityScenario(mode: string) {
    this.humidityMode = mode;
    this.humidity = this.humidityData.value + this.liquidityScenarios[mode];
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
