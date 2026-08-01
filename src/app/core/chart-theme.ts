/**
 * Canvas does not understand CSS variables, so the tokens are read off <html>
 * and handed to Chart.js as plain hex values. Called again on every theme
 * change.
 */
export interface ChartTheme {
  up: string;
  down: string;
  context: string;
  grid: string;
  axis: string;
  ink: string;
  ink2: string;
  muted: string;
  surface: string;
}

function token(styles: CSSStyleDeclaration, name: string, fallback: string): string {
  const value = styles.getPropertyValue(name).trim();
  return value || fallback;
}

export function readChartTheme(): ChartTheme {
  const styles = getComputedStyle(document.documentElement);

  return {
    up: token(styles, '--data-up', '#e34948'),
    down: token(styles, '--data-down', '#2a78d6'),
    context: token(styles, '--data-context', '#898781'),
    grid: token(styles, '--grid', '#e1e0d9'),
    axis: token(styles, '--axis', '#c3c2b7'),
    ink: token(styles, '--ink', '#0b0b0b'),
    ink2: token(styles, '--ink-2', '#52514e'),
    muted: token(styles, '--ink-muted', '#898781'),
    surface: token(styles, '--surface', '#ffffff'),
  };
}

/** A colour with an alpha channel, from hex notation (#rrggbb). */
export function alpha(hex: string, value: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) {
    return hex;
  }
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${value})`;
}
