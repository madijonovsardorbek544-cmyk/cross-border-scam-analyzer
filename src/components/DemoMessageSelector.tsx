import { demoMessages } from '../data/demoMessages';

export function DemoMessageSelector({ demoId, onSelect }: { demoId: string; onSelect: (id: string) => void }) {
  return (
    <section className="demo-box" aria-labelledby="sample-heading">
      <h2 id="sample-heading">Try a sample message</h2>
      <p className="muted">Synthetic samples help counselors and students understand common risk indicators without entering private data.</p>
      <div className="chip-row">
        {demoMessages.map((demo) => <button key={demo.id} type="button" className={demoId === demo.id ? 'active-chip' : 'chip'} onClick={() => onSelect(demo.id)}>{demo.label}</button>)}
      </div>
    </section>
  );
}
