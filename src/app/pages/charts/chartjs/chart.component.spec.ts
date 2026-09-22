import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartComponent } from './chart.component';

class FakeChart {
  static instances: FakeChart[] = [];

  data: any;
  update = jasmine.createSpy('update');
  destroy = jasmine.createSpy('destroy');

  constructor(public canvas: any, public config: any) {
    this.data = config.data;
    FakeChart.instances.push(this);
  }
}

describe('ChartComponent', () => {
  let fixture: ComponentFixture<ChartComponent>;
  let component: ChartComponent;
  let originalChart: any;

  const data = { labels: ['a'], datasets: [{ data: [1] }] };
  const options = { responsive: true };

  beforeEach(() => {
    originalChart = (window as any).Chart;
    FakeChart.instances = [];
    (window as any).Chart = FakeChart;

    TestBed.configureTestingModule({ declarations: [ChartComponent] });
    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    (window as any).Chart = originalChart;
  });

  it('creates one canvas child and calls Chart with {type, data, options}', () => {
    fixture.componentRef.setInput('type', 'bar');
    fixture.componentRef.setInput('data', data);
    fixture.componentRef.setInput('options', options);
    fixture.detectChanges();

    const canvases = fixture.nativeElement.querySelectorAll('canvas');
    expect(canvases.length).toBe(1);
    expect(FakeChart.instances.length).toBe(1);
    expect(FakeChart.instances[0].config).toEqual({ type: 'bar', data, options });
  });

  it('copies datasets/labels and calls update() when only data changes', () => {
    fixture.componentRef.setInput('type', 'bar');
    fixture.componentRef.setInput('data', data);
    fixture.detectChanges();

    const newData = { labels: ['b'], datasets: [{ data: [2] }] };
    fixture.componentRef.setInput('data', newData);
    fixture.detectChanges();

    const chart = FakeChart.instances[0];
    expect(FakeChart.instances.length).toBe(1);
    expect(chart.data.datasets).toEqual(newData.datasets);
    expect(chart.data.labels).toEqual(newData.labels);
    expect(chart.update).toHaveBeenCalled();
  });

  it('recreates the chart when options changes', () => {
    fixture.componentRef.setInput('type', 'bar');
    fixture.componentRef.setInput('data', data);
    fixture.componentRef.setInput('options', options);
    fixture.detectChanges();

    fixture.componentRef.setInput('options', { responsive: false });
    fixture.detectChanges();

    expect(FakeChart.instances.length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('canvas').length).toBe(1);
  });

  it('calls destroy() on the chart when the component is destroyed', () => {
    fixture.componentRef.setInput('type', 'bar');
    fixture.componentRef.setInput('data', data);
    fixture.detectChanges();

    fixture.destroy();

    expect(FakeChart.instances[0].destroy).toHaveBeenCalled();
  });
});
