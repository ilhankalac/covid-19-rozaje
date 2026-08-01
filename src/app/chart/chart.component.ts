import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import Chart from 'chart.js';
import { Subscription } from 'rxjs';

import { ChartTheme, alpha, readChartTheme } from '../core/chart-theme';
import { DailyStatRow } from '../core/models';
import {
  AVERAGE_WINDOW,
  formatLongDate,
  formatNumber,
  formatSigned,
} from '../core/stats';
import { ThemeService } from '../core/theme.service';
import { DataService } from '../data.service';

/** Above this many points, individual dots on the line become noise. */
const POINT_LIMIT = 60;
const MAX_BAR_THICKNESS = 24;

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class ChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('trendCanvas') trendCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('changeCanvas') changeCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendTooltip') trendTooltip: ElementRef<HTMLDivElement>;
  @ViewChild('changeTooltip') changeTooltip: ElementRef<HTMLDivElement>;

  rows: DailyStatRow[] = [];
  isLoading = true;
  readonly averageWindow = AVERAGE_WINDOW;

  private trendChart: Chart;
  private changeChart: Chart;
  private theme: ChartTheme;
  private readonly subscriptions = new Subscription();

  constructor(
    private dataService: DataService,
    private themeService: ThemeService
  ) {}

  ngAfterViewInit(): void {
    this.theme = readChartTheme();

    this.subscriptions.add(
      this.dataService.visibleRows$.subscribe((rows) => {
        this.rows = rows;
        this.isLoading = false;
        this.render();
      })
    );

    // Colours are read from CSS, so the charts are redrawn whenever the theme changes.
    this.subscriptions.add(
      this.themeService.choice$.subscribe(() => {
        this.theme = readChartTheme();
        this.destroyCharts();
        this.render();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.destroyCharts();
  }

  get hasData(): boolean {
    return this.rows.length > 0;
  }

  private destroyCharts(): void {
    if (this.trendChart) {
      this.trendChart.destroy();
      this.trendChart = null;
    }
    if (this.changeChart) {
      this.changeChart.destroy();
      this.changeChart = null;
    }
  }

  private render(): void {
    if (!this.rows.length) {
      this.destroyCharts();
      return;
    }

    // The canvas sits behind an *ngIf, so it is drawn only after Angular refreshes the view.
    setTimeout(() => {
      if (!this.rows.length || !this.trendCanvas || !this.changeCanvas) {
        return;
      }
      this.renderTrend();
      this.renderChange();
    });
  }

  /* -----------------------------------------------------------------------
     Chart 1 — trend of active cases
     ----------------------------------------------------------------------- */

  private renderTrend(): void {
    const canvas = this.trendCanvas.nativeElement;
    const context = canvas.getContext('2d');
    const labels = this.rows.map((row) => this.shortLabel(row));
    const active = this.rows.map((row) => row.activeCases);
    const average = this.rows.map((row) => row.average7);

    const fill = context.createLinearGradient(0, 0, 0, canvas.clientHeight || 320);
    fill.addColorStop(0, alpha(this.theme.up, 0.28));
    fill.addColorStop(1, alpha(this.theme.up, 0.02));

    const showPoints = this.rows.length <= POINT_LIMIT;
    const peakIndex = this.peakIndex();

    if (this.trendChart) {
      this.trendChart.data.labels = labels;
      this.trendChart.data.datasets[0].data = active;
      this.trendChart.data.datasets[0].backgroundColor = fill;
      this.trendChart.data.datasets[0].pointRadius = showPoints ? 3 : 0;
      this.trendChart.data.datasets[1].data = average;
      (this.trendChart as any).peakIndex = peakIndex;
      this.trendChart.update();
      return;
    }

    this.trendChart = new Chart(context, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Aktivni slučajevi',
            data: active,
            borderColor: this.theme.up,
            backgroundColor: fill,
            borderWidth: 2,
            fill: true,
            lineTension: 0.25,
            pointRadius: showPoints ? 3 : 0,
            pointHoverRadius: 5,
            pointBackgroundColor: this.theme.up,
            // A 2px ring in the background colour keeps the point readable over the line.
            pointBorderColor: this.theme.surface,
            pointBorderWidth: 2,
            pointHitRadius: 24,
            spanGaps: true,
          },
          {
            label: `Prosjek kroz ${AVERAGE_WINDOW} presjeka`,
            data: average,
            borderColor: this.theme.context,
            backgroundColor: 'transparent',
            borderWidth: 2,
            fill: false,
            lineTension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointBackgroundColor: this.theme.context,
            pointBorderColor: this.theme.surface,
            pointBorderWidth: 2,
            pointHitRadius: 24,
            spanGaps: true,
          },
        ],
      },
      options: this.baseOptions(this.trendTooltip.nativeElement, 'trend', 28),
      plugins: [this.crosshairPlugin(), this.peakPlugin()],
    } as any);

    (this.trendChart as any).peakIndex = peakIndex;
  }

  /* -----------------------------------------------------------------------
     Chart 2 — daily change (diverging bars)
     ----------------------------------------------------------------------- */

  private renderChange(): void {
    const context = this.changeCanvas.nativeElement.getContext('2d');
    const labels = this.rows.map((row) => this.shortLabel(row));
    const changes = this.rows.map((row) => row.change);
    const colors = changes.map((value) => this.changeColor(value));

    if (this.changeChart) {
      this.changeChart.data.labels = labels;
      this.changeChart.data.datasets[0].data = changes;
      this.changeChart.data.datasets[0].backgroundColor = colors;
      this.changeChart.update();
      return;
    }

    const options = this.baseOptions(this.changeTooltip.nativeElement, 'change', 8);
    options.scales.yAxes[0].ticks.beginAtZero = false;
    options.scales.yAxes[0].gridLines.zeroLineColor = this.theme.axis;
    options.scales.yAxes[0].gridLines.zeroLineWidth = 1;

    this.changeChart = new Chart(context, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Promjena',
            data: changes,
            backgroundColor: colors,
            borderWidth: 0,
            // Thin bars separated by the background colour, never a solid block.
            maxBarThickness: MAX_BAR_THICKNESS,
            categoryPercentage: 0.9,
            barPercentage: 0.86,
          },
        ],
      },
      options,
      plugins: [this.crosshairPlugin()],
    } as any);
  }

  private changeColor(value: number | null): string {
    if (value === null || value === 0) {
      return this.theme.muted;
    }
    return value > 0 ? this.theme.up : this.theme.down;
  }

  /* -----------------------------------------------------------------------
     Shared options
     ----------------------------------------------------------------------- */

  private baseOptions(
    tooltipElement: HTMLDivElement,
    kind: 'trend' | 'change',
    paddingTop: number
  ): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 420 },
      layout: { padding: { top: paddingTop, right: 4, left: 0, bottom: 0 } },
      legend: { display: false },
      hover: { mode: 'index', intersect: false, animationDuration: 120 },
      tooltips: {
        enabled: false,
        mode: 'index',
        intersect: false,
        custom: (model: any) => this.renderTooltip(tooltipElement, model, kind),
      },
      scales: {
        xAxes: [
          {
            gridLines: {
              display: false,
              drawBorder: true,
              color: this.theme.axis,
            },
            ticks: {
              fontColor: this.theme.muted,
              fontSize: 11,
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 9,
              padding: 6,
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              color: this.theme.grid,
              drawBorder: false,
              lineWidth: 1,
              zeroLineColor: this.theme.grid,
            },
            ticks: {
              beginAtZero: true,
              fontColor: this.theme.muted,
              fontSize: 11,
              maxTicksLimit: 6,
              padding: 8,
              callback: (value: number) => formatNumber(value),
            },
          },
        ],
      },
    };
  }

  /* -----------------------------------------------------------------------
     Drawing plugins
     ----------------------------------------------------------------------- */

  /** A vertical thread following the pointer — the reader aims at a date, not the line. */
  private crosshairPlugin(): any {
    const color = this.theme.axis;

    return {
      afterDraw: (chart: any) => {
        const active = chart.tooltip && chart.tooltip._active;
        if (!active || !active.length) {
          return;
        }

        const x = active[0]._view.x;
        const area = chart.chartArea;
        const ctx = chart.ctx;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, area.top);
        ctx.lineTo(x, area.bottom);
        ctx.lineWidth = 1;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.restore();
      },
    };
  }

  /** A direct label on the peak — the only figure printed on the chart itself. */
  private peakPlugin(): any {
    const theme = this.theme;

    return {
      afterDatasetsDraw: (chart: any) => {
        const index = chart.peakIndex;
        if (index === null || index === undefined || index < 0) {
          return;
        }

        const point = chart.getDatasetMeta(0).data[index];
        const row = this.rows[index];
        if (!point || !row) {
          return;
        }

        const text = `Vrhunac ${formatNumber(row.activeCases)}`;
        const ctx = chart.ctx;
        const area = chart.chartArea;

        ctx.save();
        ctx.font = '600 11px "Source Sans 3", system-ui, sans-serif';

        const width = ctx.measureText(text).width + 16;
        const height = 20;
        // The label is kept inside the chart area so the text never overflows.
        const x = Math.min(
          Math.max(point._view.x - width / 2, area.left),
          area.right - width
        );
        const y = Math.max(point._view.y - height - 10, 2);

        ctx.fillStyle = theme.surface;
        ctx.strokeStyle = theme.grid;
        ctx.lineWidth = 1;
        this.roundedRect(ctx, x, y, width, height, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = theme.ink2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + width / 2, y + height / 2 + 0.5);

        ctx.beginPath();
        ctx.arc(point._view.x, point._view.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = theme.up;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = theme.surface;
        ctx.stroke();

        ctx.restore();
      },
    };
  }

  private roundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  /* -----------------------------------------------------------------------
     Tooltip — the value leads, the series label is secondary
     ----------------------------------------------------------------------- */

  private renderTooltip(
    element: HTMLDivElement,
    model: any,
    kind: 'trend' | 'change'
  ): void {
    if (!model || !model.opacity || !model.dataPoints || !model.dataPoints.length) {
      element.classList.remove('is-visible');
      return;
    }

    const index = model.dataPoints[0].index;
    const row = this.rows[index];
    if (!row) {
      element.classList.remove('is-visible');
      return;
    }

    element.textContent = '';

    const title = document.createElement('p');
    title.className = 'chart-tip__title';
    title.textContent = formatLongDate(row.date);
    element.appendChild(title);

    if (kind === 'trend') {
      element.appendChild(
        this.tooltipRow(this.theme.up, 'Aktivni', formatNumber(row.activeCases))
      );
      element.appendChild(
        this.tooltipRow(
          this.theme.context,
          `Prosjek (${AVERAGE_WINDOW})`,
          formatNumber(row.average7, 1)
        )
      );
      if (row.change !== null) {
        element.appendChild(this.tooltipRow(null, 'Promjena', formatSigned(row.change)));
      }
    } else {
      element.appendChild(
        this.tooltipRow(this.changeColor(row.change), 'Promjena', formatSigned(row.change))
      );
      element.appendChild(this.tooltipRow(null, 'Aktivni', formatNumber(row.activeCases)));
      if (row.daysSincePrevious !== null && row.daysSincePrevious > 1) {
        element.appendChild(
          this.tooltipRow(null, 'Razmak', `${row.daysSincePrevious} dana od prethodnog`)
        );
      }
    }

    element.classList.add('is-visible');

    const width = element.offsetWidth || 190;
    const bounds = model._chart.canvas.clientWidth;
    const left = Math.min(Math.max(model.caretX - width / 2, 4), bounds - width - 4);

    element.style.left = `${Math.max(left, 4)}px`;
    element.style.top = `${Math.max(model.caretY - 16, 4)}px`;
  }

  /** A short dash in the series colour instead of a filled square. */
  private tooltipRow(color: string | null, label: string, value: string): HTMLElement {
    const row = document.createElement('p');
    row.className = 'chart-tip__row';

    const key = document.createElement('span');
    key.className = 'chart-tip__key';
    if (color) {
      key.style.background = color;
    } else {
      key.style.visibility = 'hidden';
    }
    row.appendChild(key);

    const name = document.createElement('span');
    name.className = 'chart-tip__label';
    name.textContent = label;
    row.appendChild(name);

    const amount = document.createElement('span');
    amount.className = 'chart-tip__value';
    amount.textContent = value;
    row.appendChild(amount);

    return row;
  }

  /* -----------------------------------------------------------------------
     Helpers
     ----------------------------------------------------------------------- */

  private peakIndex(): number {
    let index = -1;
    let best: number | null = null;

    this.rows.forEach((row, position) => {
      if (row.activeCases !== null && (best === null || row.activeCases > best)) {
        best = row.activeCases;
        index = position;
      }
    });

    return index;
  }

  /** "08.09." — the full date lives in the tooltip, the axis stays airy. */
  private shortLabel(row: DailyStatRow): string {
    const day = `${row.date.getDate()}`.padStart(2, '0');
    const month = `${row.date.getMonth() + 1}`.padStart(2, '0');
    return `${day}.${month}.`;
  }
}
