import { THEME } from './constants';

export function stressToColor(clIndex: number): string {
  if (clIndex < 30) return THEME.colors.optimal;
  if (clIndex < 60) return THEME.colors.elevated;
  if (clIndex < 80) return THEME.colors.high;
  return THEME.colors.critical;
}
