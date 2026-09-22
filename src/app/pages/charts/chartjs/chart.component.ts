import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';

declare const Chart: any;

@Component({
  selector: 'ngx-chart',
  template: '',
  styles: [':host { display: block; }'],
})
export class ChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() type: string;
  @Input() data: any;
  @Input() options: any;

  private canvas: HTMLCanvasElement;
  private chart: any;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.create();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.chart) {
      if (changes['type'] || changes['options']) {
        this.create();
      } else if (changes['data']) {
        const currentValue = changes['data'].currentValue;
        ['datasets', 'labels', 'xLabels', 'yLabels'].forEach((property) => {
          this.chart.data[property] = currentValue[property];
        });
        this.chart.update();
      }
    }
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  private create() {
    if (this.canvas) {
      this.elementRef.nativeElement.removeChild(this.canvas);
    }
    this.canvas = document.createElement('canvas');
    this.elementRef.nativeElement.appendChild(this.canvas);
    this.chart = new Chart(this.canvas, {
      type: this.type,
      data: this.data,
      options: this.options,
    });
  }
}
