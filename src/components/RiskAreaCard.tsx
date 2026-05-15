import type { CheckResult } from '../types';

export function RiskAreaCard({ title, area }: { title: string; area: CheckResult['paymentRisk'] }) {
  return <article><h3>{title}</h3><p><strong>{area.level.toUpperCase()}</strong> · {area.summary}</p>{area.evidence.length > 0 && <p className="muted">Evidence: {area.evidence.join(', ')}</p>}</article>;
}
