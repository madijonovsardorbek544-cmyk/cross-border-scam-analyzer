import { packsForText } from '../data/resourcePacks';
import type { ScamCase } from '../types';

export function CaseCard({ item }: { item: ScamCase }) {
  const relatedPacks = packsForText(`${item.scamType} ${item.messageSample}`, item.tags);
  return (
    <article className="case-card">
      <p className="eyebrow">{item.sourceType} case · {item.platform}</p>
      <h2>{item.title}</h2>
      <p className="case-summary">{item.shortSummary}</p>
      <p><strong>Target:</strong> {item.targetGroup}</p>
      <p><strong>Claimed authority:</strong> {item.fakeAuthority}</p>
      <blockquote>{item.messageSample}</blockquote>
      <h3>Risk indicators detected</h3>
      <ul className="red-flags">{item.redFlags.map((flag) => <li key={flag}>{flag}</li>)}</ul>
      <h3>Safe response</h3><p>{item.safeResponse}</p>
      {relatedPacks.length > 0 && <><h3>Relevant resource packs</h3><div className="tags">{relatedPacks.map((pack) => <span key={pack.id}>{pack.title}</span>)}</div></>}
      <div className="tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
    </article>
  );
}
