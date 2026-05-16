import { Library, Lock, School, Search, ShieldCheck } from 'lucide-react';
import { goTo } from '../data/appData';
import type { AppRoute } from '../lib/routes';

export function Landing({ setPage }: { setPage: (page: AppRoute) => void }) {
  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">Evaluation-driven scam safety for international education</p>
          <h1>Help international students verify suspicious study-abroad messages before they pay, click, or send documents.</h1>
          <p className="lead">A public MVP being built toward a validated, institution-ready scam safety platform. The checker detects risk indicators for visa, admission, scholarship, housing, testing, payment, document, and education-agent scams without storing raw messages by default.</p>
          <div className="actions"><button onClick={() => goTo('checker', setPage as (page: string) => void)}>Check a suspicious message</button><button className="secondary" onClick={() => goTo('cases', setPage as (page: string) => void)}>View case library</button><button className="ghost" onClick={() => goTo('pilot', setPage as (page: string) => void)}>Explore institution pilot</button></div>
          <div className="trust-badges"><span><Lock /> Local analysis by default</span><span><Library /> Redacted reporting</span><span><School /> Built for international students</span></div>
        </div>
        <aside className="trust-card"><ShieldCheck /><h2>Risk indicators, not certainty</h2><p>The MVP explains why a message looks risky and routes students back to official verification channels. It does not prove fraud or replace legal, immigration, financial, or emergency help.</p></aside>
      </section>
      <section className="grid four">
        <article><Search /><h3>Students and families</h3><p>Check suspicious messages before sending fees, documents, login codes, or deposits.</p></article>
        <article><Library /><h3>Counselors</h3><p>Use realistic examples, analyst explanations, and resource packs to teach verification.</p></article>
        <article><School /><h3>Institutions</h3><p>Review anonymized trends, feedback, false-positive signals, and awareness report exports.</p></article>
        <article><ShieldCheck /><h3>Privacy teams</h3><p>Local analysis, consent-based redacted reporting, and no raw message storage by default.</p></article>
      </section>
      <section className="grid two"><article className="panel"><h2>How it works</h2><ol className="checklist"><li>Paste a suspicious message and add context.</li><li>Transparent rules score study-abroad and general phishing indicators.</li><li>Results show safe next steps, verification scripts, and counselor analyst details.</li><li>Optional reports are redacted; feedback stores structured signals only.</li></ol></article><article className="panel"><h2>Built toward validation</h2><ul><li>Benchmark examples and evaluation tests track obvious misses.</li><li>Resource packs make official verification actionable.</li><li>Pilot documentation supports counselor interviews and student usability testing.</li><li>Dashboard distinguishes sample/local/Firebase data.</li></ul></article></section>
    </main>
  );
}
