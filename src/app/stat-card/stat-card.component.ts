import { Component, Input, OnChanges } from '@angular/core';

import { Trend } from '../core/models';
import { trendOf } from '../core/stats';

const SPARK_WIDTH = 120;
const SPARK_HEIGHT = 32;
const SPARK_PADDING = 3;

/**
 * A card with a single figure: label, value, an optional change and an optional
 * sparkline. The sparkline is in de-emphasised grey with the last point in the
 * accent colour — the line is context, the point is "where we are now".
 */
@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.css'],
})
export class StatCardComponent implements OnChanges {
  @Input() label = '';
  @Input() value = '—';
  @Input() unit = '';
  @Input() note = '';
  @Input() icon = '';

  /** The change beside the value. Colour follows direction, but the arrow and sign carry it. */
  @Input() delta: number | null = null;
  @Input() deltaText = '';
  @Input() deltaNote = '';
  /** For measures where a rise is not bad (e.g. snapshot count) — the chip stays neutral. */
  @Input() deltaNeutral = false;

  @Input() spark: number[] = [];

  linePath = '';
  areaPath = '';
  lastX = 0;
  lastY = 0;

  readonly sparkWidth = SPARK_WIDTH;
  readonly sparkHeight = SPARK_HEIGHT;

  get trend(): Trend {
    return this.deltaNeutral ? 'flat' : trendOf(this.delta);
  }

  get deltaIcon(): string {
    switch (trendOf(this.delta)) {
      case 'up':
        return 'arrow_upward';
      case 'down':
        return 'arrow_downward';
      default:
        return 'remove';
    }
  }

  ngOnChanges(): void {
    this.buildSparkline();
  }

  private buildSparkline(): void {
    const points = (this.spark || []).filter((value) => Number.isFinite(value));

    if (points.length < 2) {
      this.linePath = '';
      this.areaPath = '';
      return;
    }

    const min = Math.min(...points);
    const max = Math.max(...points);
    const span = max - min || 1;
    const usableHeight = SPARK_HEIGHT - SPARK_PADDING * 2;
    const step = SPARK_WIDTH / (points.length - 1);

    const coords = points.map((value, index) => ({
      x: index * step,
      y: SPARK_PADDING + usableHeight - ((value - min) / span) * usableHeight,
    }));

    this.linePath = coords
      .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
      .join(' ');

    const last = coords[coords.length - 1];
    this.areaPath = `${this.linePath} L${last.x.toFixed(1)} ${SPARK_HEIGHT} L0 ${SPARK_HEIGHT} Z`;
    this.lastX = last.x;
    this.lastY = last.y;
  }
}
