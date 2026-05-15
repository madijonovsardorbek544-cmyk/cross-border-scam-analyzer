export function Chart({ title, data }: { title: string; data: Record<string, number> }) {
  const max = Math.max(1, ...Object.values(data));
  return <section className="panel"><h2>{title}</h2><div className="bars">{Object.entries(data).sort((a, b) => b[1] - a[1]).map(([label, value]) => <div className="bar" key={label}><span>{label}</span><div aria-hidden="true"><i style={{ width: `${(value / max) * 100}%` }} /></div><strong>{value}</strong></div>)}</div></section>;
}
