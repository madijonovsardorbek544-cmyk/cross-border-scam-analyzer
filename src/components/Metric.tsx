import type { ReactNode } from 'react';

export function Metric({ title, value, icon }: { title: string; value: number; icon: ReactNode }) {
  return <article className="panel metric">{icon}<p>{title}</p><strong>{value}</strong></article>;
}
