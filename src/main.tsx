import { useMemo, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertTriangle, BarChart3, Library, Lock, School, Search, ShieldCheck } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import casesData from '../data/cases.json';
import officialResourcesData from '../data/officialResources.json';
import { analyzeMessage, validateCheckInput } from './analyzer';
import { demoMessages } from './data/demoMessages';
import { db, isFirebaseConfigured } from './firebase';
import { createAnonymizedReportPayload } from './lib/privacy/reportSchema';
import { redactSensitiveText } from './redaction';
import type { AnonymizedReportPayload, CheckInput, CheckResult, ContextType, OfficialResource, Platform, ScamCase } from './types';
import './styles.css';

const cases = casesData as ScamCase[];
const officialResources = officialResourcesData as OfficialResource[];
const platforms: Platform[] = ['email', 'SMS', 'Telegram', 'WhatsApp', 'Instagram', 'website', 'phone call', 'other'];
const contexts: ContextType[] = ['scholarship', 'visa', 'admission', 'payment', 'housing', 'test registration', 'job', 'document/legalization', 'education agent', 'other'];
const languages = ['English', 'Spanish', 'French', 'Arabic', 'Hindi', 'Mandarin', 'Portuguese', 'Vietnamese', 'Other'];
const pages = ['home', 'checker', 'cases', 'report', 'dashboard', 'pilot', 'methodology', 'privacy'];
const neverSubmitItems = ['passport scans', 'student IDs', 'card numbers', 'login codes', 'exact addresses', 'private documents', 'screenshots with personal data'];

const blankInput: CheckInput = {
  message: '',
  language: 'English',
  countryRegion: 'Student/family country or region',
  destinationCountry: 'United States',
  platform: 'email',
  context: 'scholarship',
  claimedAuthority: '',
  senderDomainOrLink: '',
};

const sampleReports: AnonymizedReportPayload[] = cases.slice(0, 14).map((item, index) => ({
  reportId: `SAMPLE-${String(index + 1).padStart(3, '0')}`,
  createdAtIso: new Date(Date.now() - index * 86400000).toISOString(),
  redactedMessage: item.messageSample.replace(/\$?\d+[\d,]*(?:\.\d+)?/g, '[REDACTED_AMOUNT]').replace(/https?:\/\/\S+/g, '[REDACTED_URL]'),
  redactionCounts: { syntheticSample: 1 },
  highRiskMarkers: [],
  language: item.language,
  countryRegion: item.originCountryRegion,
  destinationCountry: item.destinationCountryRegion,
  platform: item.platform as Platform,
  context: contexts.find((context) => item.scamType.toLowerCase().includes(context.split('/')[0])) ?? 'other',
  claimedAuthority: item.fakeAuthority,
  score: index % 4 === 0 ? 86 : index % 3 === 0 ? 67 : 48,
  level: index % 4 === 0 ? 'critical' : index % 3 === 0 ? 'high' : 'medium',
  scamTypeGuess: item.scamType,
  consentVersion: 'sample',
  deletionInstructions: 'Sample anonymized dashboard row; no personal data is present.',
}));

function goTo(page: string, setPage: (page: string) => void) {
  window.location.hash = page;
  setPage(page);
}

function copyText(text: string) {
  void navigator.clipboard?.writeText(text);
}

function Nav({ page, setPage }: { page: string; setPage: (page: string) => void }) {
  return (
    <header className="nav">
      <a className="brand" href="#home" onClick={() => setPage('home')} aria-label="Cross-Border Scam Safety home">
        <ShieldCheck /> <span>Cross-Border Scam Safety</span>
      </a>
      <nav aria-label="Primary navigation">
        {pages.map((link) => (
          <a key={link} className={page === link ? 'active' : ''} href={`#${link}`} onClick={() => setPage(link)}>
            {link}
          </a>
        ))}
      </nav>
    </header>
  );
}

function Landing({ setPage }: { setPage: (page: string) => void }) {
  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">Pilot-ready scam safety for international education</p>
          <h1>Help international students verify suspicious study-abroad messages before they pay, click, or send documents.</h1>
          <p className="lead">
            Free local-first checker for fake scholarship, visa, admission, housing, payment, document, test-registration, and education-agent messages. Institutions can pilot anonymized dashboards and awareness reports without storing raw scam messages by default.
          </p>
          <div className="actions" aria-label="Primary actions">
            <button onClick={() => goTo('checker', setPage)}>Check a suspicious message</button>
            <button className="secondary" onClick={() => goTo('cases', setPage)}>View scam case library</button>
            <button className="ghost" onClick={() => goTo('pilot', setPage)}>Explore institution pilot</button>
          </div>
          <div className="trust-badges" aria-label="Trust indicators">
            <span><Lock /> Local analysis by default</span>
            <span><Library /> Redacted reporting</span>
            <span><School /> Built for international students</span>
          </div>
        </div>
        <aside className="trust-card">
          <ShieldCheck />
          <h2>Risk indicators, not certainty</h2>
          <p>The MVP explains why a message looks risky and routes students back to official verification channels. It does not accuse people, prove fraud, or replace legal, immigration, or emergency help.</p>
        </aside>
      </section>

      <section className="grid four" aria-label="Audience overview">
        <article><Search /><h3>Students and families</h3><p>Check suspicious messages before sending fees, documents, login codes, or deposits.</p></article>
        <article><Library /><h3>Counselors</h3><p>Teach realistic study-abroad scam patterns with safe, synthetic examples.</p></article>
        <article><School /><h3>Institutions</h3><p>Review anonymized trends and export awareness reports for student support teams.</p></article>
        <article><ShieldCheck /><h3>Privacy teams</h3><p>Local analysis, redaction preview, consent, and no raw message storage by default.</p></article>
      </section>

      <section className="grid two">
        <article className="panel">
          <h2>How it works</h2>
          <ol className="checklist">
            <li>Student pastes a suspicious message and adds context such as platform, country, and destination.</li>
            <li>The rules engine scores risk indicators across authority, payment, link, document, and cross-border tactics.</li>
            <li>The result gives safe next steps, a copyable verification script, and what not to do.</li>
            <li>Optional reports are redacted and consent-based for institution trend learning.</li>
          </ol>
        </article>
        <article className="panel">
          <h2>Why this is different from a generic scam checker</h2>
          <ul className="checklist">
            <li>Study-abroad context for visa, admissions, scholarships, housing, tests, documents, and agents.</li>
            <li>Cross-border bureaucracy patterns that pressure students and families across languages and time zones.</li>
            <li>Student/family safety language that encourages trusted adult and counselor review.</li>
            <li>Institution awareness reports built from redacted, consented trends.</li>
            <li>Privacy-first reporting and official verification scripts instead of certainty claims.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}

function Checker() {
  const [input, setInput] = useState<CheckInput>(blankInput);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [demoId, setDemoId] = useState<string>('');
  const errors = validateCheckInput(input);

  const runAnalysis = (nextInput = input) => setResult(analyzeMessage(nextInput));
  const useDemo = (id: string) => {
    const demo = demoMessages.find((item) => item.id === id);
    if (!demo) return;
    setDemoId(id);
    setInput(demo.input);
    setResult(null);
  };
  const reset = () => {
    setInput({ ...blankInput, message: '' });
    setResult(null);
    setDemoId('');
  };

  return (
    <main className="stack">
      <section className="panel">
        <p className="eyebrow">Free student checker</p>
        <h1>Analyze risk indicators before you pay, click, or share documents.</h1>
        <p className="notice">Educational tool only. It detects risk indicators, not certainty. Analysis runs locally in this browser unless you choose the separate redacted reporting flow.</p>
        <section className="demo-box" aria-labelledby="sample-heading">
          <h2 id="sample-heading">Try a sample message</h2>
          <p className="muted">These are synthetic demo samples for education, based on common risk patterns. They are not real people, real partners, or verified incidents.</p>
          <div className="chip-row">
            {demoMessages.map((demo) => (
              <button key={demo.id} className={demoId === demo.id ? 'chip active-chip' : 'chip'} onClick={() => useDemo(demo.id)} title={demo.description}>
                {demo.label}
              </button>
            ))}
          </div>
        </section>
        <InputGrid input={input} setInput={setInput} />
        <label htmlFor="checker-message">Suspicious message</label>
        <textarea id="checker-message" value={input.message} maxLength={5000} onChange={(e: { target: HTMLTextAreaElement }) => setInput({ ...input, message: e.target.value })} placeholder="Paste the suspicious message here. Remove names, phone numbers, passport numbers, addresses, document images, and login details first." />
        <div className="actions">
          <button disabled={errors.length > 0} onClick={() => runAnalysis()}>Analyze locally</button>
          <button className="ghost" onClick={reset}>Analyze another message</button>
          <span className="muted">{input.message.length}/5000</span>
        </div>
        {errors.length > 0 && <ul className="errors" aria-live="polite">{errors.map((error) => <li key={error}>{error}</li>)}</ul>}
      </section>
      {result && <Result result={result} onReset={reset} />}
    </main>
  );
}

function InputGrid({ input, setInput }: { input: CheckInput; setInput: (input: CheckInput) => void }) {
  return (
    <div className="form-grid">
      <label>Language<select value={input.language} onChange={(e: { target: HTMLSelectElement }) => setInput({ ...input, language: e.target.value })}>{languages.map((x) => <option key={x}>{x}</option>)}</select></label>
      <label>Student country/region<input value={input.countryRegion} maxLength={80} onChange={(e: { target: HTMLInputElement }) => setInput({ ...input, countryRegion: e.target.value })} /></label>
      <label>Destination country<input value={input.destinationCountry} maxLength={80} onChange={(e: { target: HTMLInputElement }) => setInput({ ...input, destinationCountry: e.target.value })} /></label>
      <label>Platform<select value={input.platform} onChange={(e: { target: HTMLSelectElement }) => setInput({ ...input, platform: e.target.value as Platform })}>{platforms.map((x) => <option key={x}>{x}</option>)}</select></label>
      <label>Context<select value={input.context} onChange={(e: { target: HTMLSelectElement }) => setInput({ ...input, context: e.target.value as ContextType })}>{contexts.map((x) => <option key={x}>{x}</option>)}</select></label>
      <label>Claimed institution/authority<input value={input.claimedAuthority ?? ''} maxLength={120} onChange={(e: { target: HTMLInputElement }) => setInput({ ...input, claimedAuthority: e.target.value })} placeholder="Optional" /></label>
      <label>Sender domain or link<input value={input.senderDomainOrLink ?? ''} maxLength={180} onChange={(e: { target: HTMLInputElement }) => setInput({ ...input, senderDomainOrLink: e.target.value })} placeholder="Optional" /></label>
    </div>
  );
}

function RiskAreaCard({ title, area }: { title: string; area: CheckResult['paymentRisk'] }) {
  return <article><h3>{title}</h3><p><strong>{area.level.toUpperCase()}</strong> · {area.summary}</p>{area.evidence.length > 0 && <p className="muted">Evidence: {area.evidence.join(', ')}</p>}</article>;
}

function Result({ result, onReset }: { result: CheckResult; onReset: () => void }) {
  const topReasons = [...result.detectedTactics].sort((a, b) => b.weight - a.weight).slice(0, 3);
  const visibleTactics = result.detectedTactics.filter((x) => x.id !== 'noStrongRule');
  return (
    <section className={`panel result ${result.level}`} aria-live="polite">
      <div className="score">
        <div>
          <p className="eyebrow">Risk indicators detected</p>
          <h2><span className="big-score">{result.score}</span>/100</h2>
          <p><strong>Risk level:</strong> {result.level.toUpperCase()} · <strong>Confidence:</strong> {result.confidenceLevel.toUpperCase()}</p>
          <p>{result.level === 'low' ? 'No strong scam pattern was detected. Stay calm and verify through official channels before acting.' : result.falsePositiveWarning}</p>
        </div>
        <AlertTriangle aria-hidden="true" />
      </div>
      <div className="grid three">
        <article><h3>Top 3 reasons first</h3><ol className="checklist">{topReasons.map((x) => <li key={x.id}><strong>{x.label}</strong><br /><span>{x.description}</span>{x.evidence.length > 0 && <small> Evidence: {x.evidence.join(', ')}</small>}</li>)}</ol></article>
        <article><h3>Why this was flagged</h3><p>{visibleTactics.length > 0 ? 'The message matched these educational risk indicators:' : 'No strong rule matched; continue normal verification.'}</p><ul className="flag-list">{visibleTactics.map((x) => <li key={x.id}><strong>{x.label}</strong>{x.evidence.length > 0 && <span> — {x.evidence.join(', ')}</span>}</li>)}</ul></article>
        <article><h3>False-positive warning</h3><p>{result.falsePositiveWarning}</p><h3>Authority/context check</h3><p>{result.fakeAuthorityType}</p></article>
      </div>
      <div className="grid four"><RiskAreaCard title="Account security risk" area={result.accountSecurityRisk} /><RiskAreaCard title="Credential risk" area={result.credentialRisk} /><RiskAreaCard title="Financial account risk" area={result.financialAccountRisk} /><RiskAreaCard title="Action pressure risk" area={result.actionPressureRisk} /></div>
      <div className="grid three"><RiskAreaCard title="Payment risk" area={result.paymentRisk} /><RiskAreaCard title="Sensitive data risk" area={result.sensitiveDataRisk} /><RiskAreaCard title="Link/domain risk" area={result.linkDomainRisk} /></div>
      <div className="grid two">
        <article><h3>What you should do now</h3><ol className="checklist">{result.safeNextSteps.map((x) => <li key={x}>{x}</li>)}</ol><p className="notice">{result.trustedAdultNote}</p><h3>Cross-border adaptation pattern</h3><p>{result.crossBorderAdaptationPattern}</p></article>
        <article><h3>What you should not do</h3><ul>{result.whatNotToDo.map((x) => <li key={x}>{x}</li>)}</ul><h3>Copyable verification script</h3><blockquote>{result.officialVerificationScript}</blockquote><div className="actions"><button onClick={() => copyText(result.officialVerificationScript)}><Library /> Copy verification script</button><button className="ghost" onClick={onReset}>Analyze another message</button></div></article>
      </div>
    </section>
  );
}

function CaseLibrary() {
  const [filters, setFilters] = useState({ scamType: '', platform: '', sourceType: '', tactic: '' });
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const confidenceRank: Record<ScamCase['confidenceLevel'], number> = { high: 3, medium: 2, low: 1 };
  const sorted = [...cases].sort((a, b) => confidenceRank[b.confidenceLevel] - confidenceRank[a.confidenceLevel] || a.scamType.localeCompare(b.scamType));
  const filtered = sorted.filter((item) => {
    const haystack = [item.title, item.shortSummary, item.scamType, item.platform, item.targetGroup, item.destinationCountryRegion, item.fakeAuthority, item.tags.join(' ')].join(' ').toLowerCase();
    return (!normalizedQuery || haystack.includes(normalizedQuery)) && (!filters.scamType || item.scamType === filters.scamType) && (!filters.platform || item.platform === filters.platform) && (!filters.sourceType || item.sourceType === filters.sourceType) && (!filters.tactic || item.psychologicalTactics.includes(filters.tactic));
  });
  const option = (key: keyof typeof filters, label: string, values: string[]) => (
    <label>{label}<select value={filters[key]} onChange={(e: { target: HTMLSelectElement }) => setFilters({ ...filters, [key]: e.target.value })}><option value="">All</option>{Array.from(new Set(values)).sort().map((x) => <option key={x}>{x}</option>)}</select></label>
  );

  return (
    <main className="stack">
      <section className="panel">
        <p className="eyebrow">Case library</p>
        <h1>Study-abroad scam intelligence for safer counseling conversations.</h1>
        <p className="warning"><strong>Use this library to learn scam patterns, not to identify or accuse individuals.</strong> Cases support counseling and prevention conversations; they are not evidence against a specific person.</p><div className="source-guide"><span><strong>Synthetic:</strong> created for education based on common patterns</span><span><strong>Example:</strong> realistic example, not tied to a specific victim</span><span><strong>Public:</strong> based on a publicly reported pattern</span><span><strong>Verified:</strong> reviewed with reliable evidence or institution confirmation</span></div><p className="notice">How to use cases: compare red flags, rehearse safe responses, then verify through official channels. Do not forward private screenshots or accuse senders based only on similarity.</p>
        <label htmlFor="case-search">Search cases<input id="case-search" value={query} onChange={(e: { target: HTMLInputElement }) => setQuery(e.target.value)} placeholder="Search by scam type, platform, country, target group, or authority" /></label>
        <div className="filters">{option('scamType', 'Scam type', cases.map((x) => x.scamType))}{option('platform', 'Platform', cases.map((x) => x.platform))}{option('sourceType', 'Source label', cases.map((x) => x.sourceType))}{option('tactic', 'Tactic', cases.flatMap((x) => x.psychologicalTactics))}</div>
        <p className="muted">Showing {filtered.length} of {cases.length} cases · sorted by most relevant cases: high confidence first, then scam type.</p>
      </section>
      <section className="case-grid">
        {filtered.map((item) => <CaseCard key={item.id} item={item} />)}
      </section>
      {filtered.length === 0 && <section className="empty">No cases match those filters.</section>}
    </main>
  );
}

function CaseCard({ item }: { item: ScamCase }) {
  return (
    <article className="case-card">
      <p className="eyebrow">{item.id} · {item.confidenceLevel} confidence · source: {item.sourceType}</p>
      <h2>{item.title}</h2>
      <p className="case-summary">{item.shortSummary}</p>
      <div className="tags"><span>{item.scamType}</span><span>{item.platform}</span><span>{item.targetGroup}</span><span>{item.destinationCountryRegion}</span></div>
      <p className="notice"><strong>Safe response:</strong> {item.safeResponse}</p>
      <blockquote>{item.messageSample}</blockquote>
      <p><strong>Fake authority:</strong> {item.fakeAuthority}</p>
      <p><strong>Route:</strong> {item.originCountryRegion} → {item.destinationCountryRegion}</p>
      <h3>Red flags</h3>
      <ul className="flag-list red-flags">{item.redFlags.map((flag) => <li key={flag}>{flag}</li>)}</ul>
      <p><strong>Why this works psychologically:</strong> {item.psychologicalTactics.join(', ')} create pressure, trust, fear, scarcity, or confusion so the student acts before verifying.</p>
      <p><strong>Cross-border adaptation:</strong> {item.crossBorderAdaptation}</p>
      <h3>Official verification steps</h3>
      <ol className="checklist">{item.officialVerificationSteps.map((step) => <li key={step}>{step}</li>)}</ol>
      <p className="muted"><strong>Similar cases:</strong> Search for {item.tags.slice(0, 3).join(', ')} or filter by {item.scamType}.</p>
    </article>
  );
}

function ReportPage() {
  const [input, setInput] = useState<CheckInput>({ ...blankInput, countryRegion: '', destinationCountry: '', context: 'visa' });
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('');
  const [payload, setPayload] = useState<AnonymizedReportPayload | null>(null);
  const redaction = useMemo(() => redactSensitiveText(input.message), [input.message]);

  async function submit() {
    const result = analyzeMessage({ ...input, message: input.message || 'No message supplied' });
    const nextPayload = createAnonymizedReportPayload(input, result);
    setPayload(nextPayload);
    if (isFirebaseConfigured && db) {
      await addDoc(collection(db, 'reports'), { ...nextPayload, createdAt: serverTimestamp() });
      setStatus(`Submitted redacted report ${nextPayload.reportId} to Firebase. Raw suspicious messages are not stored by this flow.`);
    } else {
      const existing = JSON.parse(localStorage.getItem('cbssLocalReports') ?? '[]') as AnonymizedReportPayload[];
      localStorage.setItem('cbssLocalReports', JSON.stringify([nextPayload, ...existing].slice(0, 50)));
      setStatus(`Local-only mode: saved redacted report ${nextPayload.reportId} in this browser only. Configure Firebase for institution pilots.`);
    }
  }
  const clearForm = () => { setInput({ ...blankInput, countryRegion: '', destinationCountry: '', context: 'visa', message: '' }); setConsent(false); setStatus(''); setPayload(null); };

  return (
    <main className="stack">
      <section className="panel">
        <p className="eyebrow">Redacted reporting</p>
        <h1>Submit an anonymized trend report only after previewing redaction.</h1>
        <div className="steps"><span>1 Paste suspicious message</span><span>2 Review redacted preview</span><span>3 Consent to anonymized report</span><span>4 Save report ID</span></div>
        <div className="warning"><strong>Never submit:</strong><ul>{neverSubmitItems.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <p className="notice">Local-only mode stores redacted reports in this browser only. Firebase mode submits the anonymized payload to configured Firestore. Neither mode intentionally stores raw suspicious messages by default.</p>
        <InputGrid input={input} setInput={setInput} />
        <label htmlFor="report-message">Suspicious message for redaction preview</label>
        <textarea id="report-message" value={input.message} maxLength={5000} onChange={(e: { target: HTMLTextAreaElement }) => setInput({ ...input, message: e.target.value })} />
      </section>
      <section className="panel">
        <h2>Redacted preview</h2>
        <pre className="preview">{redaction.redactedText || 'Paste a message to generate a redacted preview.'}</pre>
        <p className="muted">Replacement counts: {JSON.stringify(redaction.replacements)}</p>
        <label className="checkbox"><input type="checkbox" checked={consent} onChange={(e: { target: HTMLInputElement }) => setConsent(e.target.checked)} /> I reviewed the redacted preview and consent to submit only anonymized/redacted fields for safety trend analysis.</label>
        <div className="actions"><button disabled={!consent || !input.message.trim()} onClick={submit}>Submit anonymized report</button><button className="ghost" onClick={clearForm}>Clear form</button></div>
        {status && <p className="notice">{status}</p>}
        {payload && <div className="report-id"><strong>Report ID: {payload.reportId}</strong><button className="ghost" onClick={() => copyText(payload.reportId)}><Library /> Copy report ID</button><p className="muted">Future deletion instruction: {payload.deletionInstructions}</p></div>}
      </section>
    </main>
  );
}

function Dashboard() {
  const local = useMemo(() => JSON.parse(localStorage.getItem('cbssLocalReports') ?? '[]') as AnonymizedReportPayload[], []);
  const reports = local.length ? local : sampleReports;
  const countBy = (key: keyof AnonymizedReportPayload) => reports.reduce<Record<string, number>>((acc, report) => { const value = String(report[key] ?? 'Unknown'); acc[value] = (acc[value] ?? 0) + 1; return acc; }, {});
  const topRisks = Object.entries(countBy('scamTypeGuess')).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const downloadReport = () => {
    const byScam = countBy('scamTypeGuess');
    const markdown = `# International Student Scam Awareness Report\n\nGenerated: ${new Date().toISOString()}\n\n## Summary\n- Total anonymized reports: ${reports.length}\n- Mode: ${local.length ? 'local browser reports' : 'sample/local anonymized data'}\n\n## Top scam categories\n${Object.entries(byScam).map(([k, v]) => `- ${k}: ${v}`).join('\n')}\n\n## Recommended school actions\n- Publish official payment, visa, housing, and document verification pages.\n- Train counselors to ask students for redacted screenshots only.\n- Add a pre-arrival scam warning to admitted-student communications.\n- Provide a trusted escalation contact for parents and minors.\n\n## Student checklist\n- Verify links by typing official URLs manually.\n- Do not pay personal accounts, crypto, gift cards, or chat-only invoices.\n- Ask a counselor or trusted adult before sharing documents.\n`;
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown' }));
    const a = document.createElement('a'); a.href = url; a.download = 'student-scam-awareness-report.md'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <main className="stack">
      <section className="panel">
        <p className="eyebrow">Institution pilot dashboard</p>
        <h1>Anonymized scam trend intelligence for student support teams.</h1>
        <p className="notice">{local.length ? 'Using redacted reports saved in this browser.' : 'This is sample/local anonymized data because Firebase/local institution reports are not connected.'}</p>
        <button onClick={downloadReport}>Export report</button>
      </section>
      <section className="grid four"><Metric title="Total anonymized reports" value={reports.length} icon={<BarChart3 />} /><Metric title="High/Critical reports" value={reports.filter((r) => ['high', 'critical'].includes(r.level)).length} icon={<AlertTriangle />} /><Metric title="Platforms observed" value={Object.keys(countBy('platform')).length} icon={<School />} /><Metric title="Destination markets" value={Object.keys(countBy('destinationCountry')).length} icon={<Library />} /></section>
      <section className="grid two"><Chart title="Reports by scam type" data={countBy('scamTypeGuess')} /><Chart title="Reports by platform" data={countBy('platform')} /></section>
      <section className="grid two"><Chart title="Reports by fake authority" data={countBy('claimedAuthority')} /><Chart title="Reports by risk level" data={countBy('level')} /></section>
      <section className="grid three"><article className="panel"><h2>Top risks this month</h2><ol className="checklist">{topRisks.map(([risk, count]) => <li key={risk}>{risk}: {count}</li>)}</ol></article><article className="panel"><h2>Recommended school actions</h2><ol className="checklist"><li>Publish official payment and refund instructions.</li><li>Add visa and housing verification scripts to pre-arrival emails.</li><li>Train staff to request redacted screenshots only.</li><li>Escalate threats involving minors, coercion, or financial loss to appropriate support channels.</li></ol></article><article className="panel"><h2>Parent/student warning script</h2><blockquote>Before paying or sending documents, verify through the official school website, embassy/visa portal, or testing provider. Do not trust chat-only payment instructions or urgent threats.</blockquote></article></section>
      <section className="panel"><h2>Latest redacted reports</h2>{reports.slice(0, 6).map((r) => <div className="report-row" key={r.reportId}><strong>{r.reportId}</strong><span>{r.level} · {r.platform} · {r.scamTypeGuess}</span><p>{r.redactedMessage}</p></div>)}</section>
    </main>
  );
}

function Metric({ title, value, icon }: { title: string; value: number; icon: ReactNode }) { return <article className="panel metric">{icon}<p>{title}</p><strong>{value}</strong></article>; }
function Chart({ title, data }: { title: string; data: Record<string, number> }) { const max = Math.max(1, ...Object.values(data)); return <section className="panel"><h2>{title}</h2><div className="bars">{Object.entries(data).sort((a, b) => b[1] - a[1]).map(([label, value]) => <div className="bar" key={label}><span>{label}</span><div aria-hidden="true"><i style={{ width: `${(value / max) * 100}%` }} /></div><strong>{value}</strong></div>)}</div></section>; }

function PilotPage() {
  return (
    <main className="stack">
      <section className="hero compact"><div><p className="eyebrow">30-day institution pilot</p><h1>Help students verify high-risk messages before money or documents are lost.</h1><p className="lead">Built for high schools, education centers, admissions counselors, scholarship programs, and international student support offices.</p><p className="notice"><strong>Pilot contact:</strong> add your email in README or repository profile before outreach.</p></div><aside className="trust-card"><School /><h2>Professional pilot deliverables</h2><p>Trend dashboard, verified resources, awareness report, and student safety page templates using anonymized data only.</p></aside></section>
      <section className="grid two"><article className="panel"><h2>Who this pilot is for</h2><ul><li>Education centers advising outbound students.</li><li>High school counselors and scholarship advisors.</li><li>Admissions or international student support teams.</li><li>Programs receiving recurring scam questions from families.</li></ul></article><article className="panel"><h2>Problem it solves</h2><p>Institutions see recurring scam questions but often lack a safe way to collect redacted patterns, teach students, and prove which interventions are needed.</p></article></section>
      <section className="panel"><h2>30-day pilot timeline</h2><ol className="timeline"><li><strong>Week 1:</strong> configure official resources and counselor escalation language.</li><li><strong>Week 2:</strong> share student checker and pre-arrival scam guidance.</li><li><strong>Week 3:</strong> review anonymized trends and top fake authorities.</li><li><strong>Week 4:</strong> export awareness report and decide whether to continue.</li></ol></section>
      <section className="grid two"><article className="panel"><h2>What institutions receive</h2><ul><li>Student checker link and sample classroom synthetic sample messages.</li><li>Case library for awareness training.</li><li>Anonymized dashboard and exportable awareness report.</li><li>Template warning scripts for students, parents, and counselors.</li></ul></article><article className="panel"><h2>Privacy and student safety</h2><p>Scores are indicators, not accusations. Students are encouraged to verify with official channels and trusted adults. Reports are redacted before consented submission.</p></article></section>
      <section className="grid two"><article className="panel"><h2>What data is collected</h2><ul><li>Redacted message preview with consent.</li><li>Scam category, platform, country/region, destination, and risk level.</li><li>Optional claimed authority and sender host, not full raw links by default.</li></ul></article><article className="panel"><h2>What data is never collected by default</h2><ul><li>Raw suspicious messages.</li><li>Passport scans, student IDs, bank details, card numbers, credentials, or document images.</li><li>Legal conclusions or law-enforcement case files.</li></ul></article></section>
      <section className="grid two"><article className="panel"><h2>Pricing hypothesis</h2><p>Students use the checker for free. Institutions may pay for dashboards, awareness reports, verified resources, student safety pages, and anonymized scam trend intelligence.</p><p className="notice">School pilot: $500–$2,000/year; institution dashboard: $5,000–$10,000/year if validated. These are hypotheses, not achieved revenue.</p></article><article className="panel"><h2>Pilot readiness checklist</h2><ol className="checklist"><li>Confirm official payment, admissions, visa, housing, and testing links.</li><li>Name a counselor or staff owner for escalations.</li><li>Approve privacy language for redacted reporting.</li><li>Decide what success means after 30 days.</li></ol></article></section>
    </main>
  );
}

function Methodology() {
  return <main className="stack"><section className="panel"><p className="eyebrow">Methodology</p><h1>Transparent rules, not black-box certainty.</h1><p>The analyzer scores risk indicators including urgency, account security threats, identity verification requests, click/action pressure, credential or OTP risk, financial account/card risk, authority impersonation, sensitive-data requests, payment pressure, suspicious domains, unofficial payment channels, vague institutions, guarantees, visa threats, housing scarcity, test score upgrade claims, and cross-border bureaucracy confusion.</p><p className="notice">Scores support safer verification decisions. They do not prove fraud, replace legal advice, or guarantee safety.</p></section><section className="panel"><h2>Why this is different from a generic scam checker</h2><div className="grid three"><article><h3>Study-abroad context</h3><p>Rules are tuned for admissions, visas, scholarships, housing, documents, testing, and agents.</p></article><article><h3>Institution awareness</h3><p>Optional redacted reporting turns individual questions into safer training themes.</p></article><article><h3>Verification scripts</h3><p>Results give copyable language for contacting official channels without accusing anyone.</p></article></div></section><section className="grid two"><article className="panel"><h2>Official resources</h2><div className="resource-list">{officialResources.map((r) => <article key={r.id}><h3>{r.name}</h3><p>{r.country} · {r.institutionType}</p><a href={r.officialWebsite} target="_blank" rel="noreferrer">Official website</a><p>{r.verificationAdvice}</p><small>Reviewed: {r.lastReviewedDate}</small></article>)}</div></article><article className="panel"><h2>Limitations</h2><ul><li>Rule matching can miss new scam language or over-score legitimate deadlines.</li><li>Redaction is best effort and should not receive private documents.</li><li>Institutions must replace template resources before production pilots.</li><li>Firebase rules and authentication require review before real deployment.</li></ul></article></section></main>;
}

function PrivacyPage() { return <main className="stack"><section className="panel"><p className="eyebrow">Privacy and safety</p><h1>Privacy-first reporting for vulnerable students and families.</h1><div className="grid two"><article><Lock /><h2>Principles</h2><ul><li>Analyze locally by default.</li><li>Never store raw suspicious messages by default.</li><li>Require redaction preview and consent before report submission.</li><li>Use anonymized trend data for institution dashboards.</li></ul></article><article><School /><h2>Student safety</h2><p>Students and minors should not handle threats alone. The product encourages review by trusted adults, counselors, and official institution contacts.</p><p>No public GitHub issue workflow should be used for scam messages or private data.</p></article></div></section></main>; }

function App() {
  const [page, setPage] = useState<string>(window.location.hash.replace('#', '') || 'home');
  const render = () => ({ home: <Landing setPage={setPage} />, checker: <Checker />, cases: <CaseLibrary />, report: <ReportPage />, dashboard: <Dashboard />, pilot: <PilotPage />, methodology: <Methodology />, privacy: <PrivacyPage /> }[page] ?? <Landing setPage={setPage} />);
  return <><Nav page={page} setPage={setPage} />{render()}<footer><Library /> MVP foundation for validation with education partners. Risk indicators detected ≠ certainty.</footer></>;
}

createRoot(document.getElementById('root')!).render(<App />);
