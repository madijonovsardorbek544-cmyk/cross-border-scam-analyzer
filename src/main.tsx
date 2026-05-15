import { useMemo, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { ShieldCheck, Search, Library, School, Lock, AlertTriangle, BarChart3 } from 'lucide-react';
import cases from '../data/cases.json';
import officialResources from '../data/officialResources.json';
import scoringRules from '../data/scoringRules.json';
import { analyzeMessage, validateCheckInput } from './analyzer';
import { redactSensitiveText } from './redaction';
import { isFirebaseConfigured, db } from './firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { CheckInput, CheckResult, Platform, ContextType, ScamCase } from './types';
import './styles.css';

const platforms: Platform[] = ['email', 'SMS', 'Telegram', 'WhatsApp', 'Instagram', 'website', 'other'];
const contexts: ContextType[] = ['scholarship', 'visa', 'admission', 'payment', 'housing', 'test registration', 'job', 'other'];
const languages = ['English', 'Spanish', 'French', 'Arabic', 'Hindi', 'Mandarin', 'Portuguese', 'Other'];

function Nav({ page, setPage }: { page: string; setPage: (page: string) => void }) {
  const links = ['home', 'checker', 'cases', 'report', 'dashboard', 'methodology', 'privacy'];
  return <header className="nav"><a className="brand" href="#home" onClick={() => setPage('home')}><ShieldCheck /> Cross-Border Scam Safety</a><nav>{links.map(link => <a key={link} className={page === link ? 'active' : ''} href={`#${link}`} onClick={() => setPage(link)}>{link}</a>)}</nav></header>;
}

function Landing({ setPage }: { setPage: (page: string) => void }) {
  return <main>
    <section className="hero"><div><p className="eyebrow">Privacy-first safety for study abroad decisions</p><h1>Protecting international students from fake scholarship, visa, admission, and payment scams.</h1><p className="lead">A browser-first scam checker and case intelligence platform for students, parents, counselors, and education centers.</p><div className="actions"><button onClick={() => setPage('checker')}>Check a suspicious message</button><button className="secondary" onClick={() => setPage('cases')}>Explore case library</button><button className="ghost" onClick={() => setPage('dashboard')}>School pilot dashboard</button></div></div><aside className="trust-card"><Lock /><h2>Local by default</h2><p>Pasted messages are analyzed in your browser. Nothing is uploaded unless you choose the report flow and preview redaction first.</p></aside></section>
    <section className="grid four"><article><Search /><h3>Student scam checker</h3><p>Scores risk indicators for study-abroad contexts, not generic scams.</p></article><article><Library /><h3>Cross-border cases</h3><p>Scholarship, visa, housing, admission, testing, and payment examples.</p></article><article><School /><h3>Institution pilots</h3><p>Awareness reports for schools and education centers using anonymized trends.</p></article><article><ShieldCheck /><h3>Safer UX</h3><p>No public GitHub issue reporting and no raw message storage by default.</p></article></section>
    <section className="panel"><h2>Built for trust</h2><p>Students and families are often asked to make fast cross-border decisions in unfamiliar systems. This MVP makes verification steps explicit, highlights uncertainty, and routes users back to official channels.</p></section>
  </main>;
}

function Checker() {
  const [input, setInput] = useState<CheckInput>({ message: '', language: 'English', countryRegion: 'United States', platform: 'email', context: 'scholarship' });
  const [result, setResult] = useState<CheckResult | null>(null);
  const errors = validateCheckInput(input);
  return <main className="stack"><section className="panel"><p className="eyebrow">Scam Checker</p><h1>Analyze risk indicators before you pay or share documents.</h1><p className="notice">Educational tool only. It detects risk indicators, not certainty. Analysis runs locally in this browser.</p><div className="form-grid"><label>Language<select value={input.language} onChange={e => setInput({ ...input, language: e.target.value })}>{languages.map(x => <option key={x}>{x}</option>)}</select></label><label>Country/region<input value={input.countryRegion} maxLength={80} onChange={e => setInput({ ...input, countryRegion: e.target.value })} /></label><label>Platform<select value={input.platform} onChange={e => setInput({ ...input, platform: e.target.value as Platform })}>{platforms.map(x => <option key={x}>{x}</option>)}</select></label><label>Context<select value={input.context} onChange={e => setInput({ ...input, context: e.target.value as ContextType })}>{contexts.map(x => <option key={x}>{x}</option>)}</select></label></div><label>Suspicious message<textarea value={input.message} maxLength={5000} onChange={e => setInput({ ...input, message: e.target.value })} placeholder="Paste the suspicious message here. Remove names, phone numbers, passport numbers, addresses, and document images first." /></label><div className="actions"><button disabled={errors.length > 0} onClick={() => setResult(analyzeMessage(input))}>Analyze locally</button><span>{input.message.length}/5000</span></div>{errors.length > 0 && <ul className="errors">{errors.map(e => <li key={e}>{e}</li>)}</ul>}</section>{result && <Result result={result} />}</main>;
}

function Result({ result }: { result: CheckResult }) {
  return <section className={`panel result ${result.level}`}><div className="score"><div><p className="eyebrow">Risk indicators detected</p><h2>{result.score}/100 · {result.level.toUpperCase()}</h2></div><AlertTriangle /></div><div className="grid three"><article><h3>Detected tactics</h3><ul>{result.detectedTactics.map(x => <li key={x}>{x}</li>)}</ul></article><article><h3>Authority type</h3><p>{result.fakeAuthorityType}</p></article><article><h3>Risk areas</h3><p>{result.sensitiveDataRisk}</p><p>{result.paymentRisk}</p><p>{result.linkDomainRisk}</p></article></div><h3>Safe next steps</h3><ol>{result.safeNextSteps.map(x => <li key={x}>{x}</li>)}</ol><h3>Verify through official channel checklist</h3><ul className="checklist">{result.officialChecklist.map(x => <li key={x}>{x}</li>)}</ul></section>;
}

function CasesPage() {
  const [filter, setFilter] = useState({ scamType: '', country: '', platform: '', language: '', target: '', tactic: '' });
  const allCases = cases as ScamCase[];
  const filtered = allCases.filter(c => (!filter.scamType || c.scamType === filter.scamType) && (!filter.country || c.countryRegion.includes(filter.country)) && (!filter.platform || c.platform === filter.platform) && (!filter.language || c.language === filter.language) && (!filter.target || c.targetGroup === filter.target) && (!filter.tactic || c.psychologicalTactics.includes(filter.tactic)));
  const unique = (key: keyof ScamCase) => [...new Set(allCases.map(c => String(c[key])))];
  const tactics = [...new Set(allCases.flatMap(c => c.psychologicalTactics))];
  return <main className="stack"><section className="panel"><p className="eyebrow">Case Library</p><h1>International-student scam intelligence</h1><p>Structured seed cases designed to expand from 10 to 50+ examples.</p><div className="filters"><select onChange={e => setFilter({ ...filter, scamType: e.target.value })}><option value="">All scam types</option>{unique('scamType').map(x => <option key={x}>{x}</option>)}</select><select onChange={e => setFilter({ ...filter, country: e.target.value })}><option value="">All regions</option>{unique('countryRegion').map(x => <option key={x}>{x}</option>)}</select><select onChange={e => setFilter({ ...filter, platform: e.target.value })}><option value="">All platforms</option>{unique('platform').map(x => <option key={x}>{x}</option>)}</select><select onChange={e => setFilter({ ...filter, language: e.target.value })}><option value="">All languages</option>{unique('language').map(x => <option key={x}>{x}</option>)}</select><select onChange={e => setFilter({ ...filter, target: e.target.value })}><option value="">All targets</option>{unique('targetGroup').map(x => <option key={x}>{x}</option>)}</select><select onChange={e => setFilter({ ...filter, tactic: e.target.value })}><option value="">All tactics</option>{tactics.map(x => <option key={x}>{x}</option>)}</select></div></section><section className="case-grid">{filtered.length ? filtered.map(c => <CaseCard key={c.id} c={c} />) : <div className="empty">No cases match these filters yet.</div>}</section></main>;
}

function CaseCard({ c }: { c: ScamCase }) { return <article className="case-card"><p className="eyebrow">{c.id} · {c.sourceType} · {c.confidenceLevel} confidence</p><h2>{c.title}</h2><div className="tags"><span>{c.scamType}</span><span>{c.countryRegion}</span><span>{c.platform}</span><span>{c.language}</span></div><blockquote>{c.messageSample}</blockquote><p><strong>Fake authority:</strong> {c.fakeAuthority}</p><p><strong>Tactics:</strong> {c.psychologicalTactics.join(', ')}</p><p><strong>Red flags:</strong> {c.redFlags.join(', ')}</p><p><strong>Cross-border adaptation:</strong> {c.crossBorderAdaptation}</p><p><strong>Safe response:</strong> {c.safeResponse}</p></article>; }

function ReportPage() {
  const [text, setText] = useState('');
  const [meta, setMeta] = useState({ language: 'English', countryRegion: 'United States', platform: 'email', context: 'scholarship' });
  const redacted = useMemo(() => redactSensitiveText(text), [text]);
  const [status, setStatus] = useState('');
  async function submitReport() {
    if (!text.trim()) return;
    const payload = { redactedMessage: redacted.redactedText, ...meta, source: 'student-report', status: 'new', redactionSummary: redacted.replacements, createdAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString() };
    if (isFirebaseConfigured && db) {
      const ref = await addDoc(collection(db, 'reports'), payload);
      setStatus(`Submitted anonymized report ${ref.id}. Save this ID if you later need deletion/admin support.`);
      return;
    }
    localStorage.setItem(`cbss-report-${Date.now()}`, JSON.stringify(payload));
    setStatus('Saved locally only because Firebase is not configured. In production, this redacted payload is stored in Firestore and linked to a delete/admin-support process.');
  }
  return <main className="stack"><section className="panel"><p className="eyebrow">Safe report flow</p><h1>Report a scam without exposing private data.</h1><p className="warning">Do not include names, phone numbers, exact addresses, passport numbers, payment card numbers, private documents, or screenshots containing personal data. Reports are anonymized before submission.</p><div className="form-grid"><label>Language<select value={meta.language} onChange={e => setMeta({ ...meta, language: e.target.value })}>{languages.map(x => <option key={x}>{x}</option>)}</select></label><label>Country/region<input value={meta.countryRegion} maxLength={80} onChange={e => setMeta({ ...meta, countryRegion: e.target.value })} /></label><label>Platform<select value={meta.platform} onChange={e => setMeta({ ...meta, platform: e.target.value })}>{platforms.map(x => <option key={x}>{x}</option>)}</select></label><label>Context<select value={meta.context} onChange={e => setMeta({ ...meta, context: e.target.value })}>{contexts.map(x => <option key={x}>{x}</option>)}</select></label></div><textarea value={text} maxLength={5000} onChange={e => setText(e.target.value)} placeholder="Paste only the scam message text. Remove personal details first." /><h2>Redacted preview</h2><pre className="preview">{redacted.redactedText || 'Your redacted preview will appear here.'}</pre><p>Redactions: {Object.entries(redacted.replacements).map(([k, v]) => `${k}: ${v}`).join(' · ')}</p><button disabled={!text.trim()} onClick={submitReport}>Submit anonymized report</button>{status && <p className="notice">{status}</p>}</section></main>;
}

function Dashboard() {
  const topCategories = ['Visa impersonation', 'Scholarship fee scam', 'Housing deposit scam'];
  return <main className="stack"><section className="panel"><p className="eyebrow">Dashboard MVP</p><h1>Student safety profile and institution trend preview</h1><p className="notice">Recent checks stay local unless the user explicitly opts in. Firebase configured: {isFirebaseConfigured ? 'yes' : 'no — local-only MVP mode'}.</p><div className="grid two"><article><h2>Student profile</h2><label>Age group<select><option>Under 18</option><option>18–24</option><option>25+</option></select></label><label>Region<input placeholder="e.g., South Asia" /></label><label>Interests<input placeholder="scholarships, visa, housing" /></label><p>Recommended: verify scholarship fees, official visa portals, and housing deposits before payment.</p></article><article><h2>Institution pilot view</h2><BarChart3 /><p>Top categories: {topCategories.join(', ')}</p><p>Top fake authorities: immigration office, university finance, testing provider.</p><p>Top platforms: WhatsApp, email, Telegram.</p><button>Export awareness report</button></article></div></section></main>;
}

function Methodology() { return <main className="stack"><section className="panel"><p className="eyebrow">Methodology</p><h1>Transparent scoring rubric</h1><p>The checker scores educational risk indicators from 0–100. It does not prove fraud, replace official verification, or provide law-enforcement determinations.</p><div className="grid three">{scoringRules.rubric.map(r => <article key={r.id}><h3>{r.label}</h3><p>{r.description}</p><strong>{r.weight} points</strong></article>)}</div><h2>Limitations</h2><p>Legitimate institutions can use urgent language, and scams may avoid obvious keywords. False positives and false negatives are possible, especially across languages. Treat results as a prompt to verify through official channels.</p><h2>Official resources</h2><div className="resource-list">{officialResources.map(r => <article key={r.name}><h3>{r.name}</h3><p>{r.country} · {r.institutionType}</p><a href={r.officialWebsite} target="_blank" rel="noreferrer">Official website</a><p>{r.verificationAdvice}</p></article>)}</div></section></main>; }

function Privacy() { return <main className="stack"><section className="panel"><p className="eyebrow">Privacy</p><h1>Local analysis by default. Minimal data by design.</h1><ul className="checklist"><li>Suspicious messages are analyzed in the browser unless you choose to report.</li><li>Raw suspicious messages are not stored by default.</li><li>Anonymized reports store redacted text, context, platform, region, language, score, and redaction summary only.</li><li>Never submit passport numbers, payment cards, exact addresses, private documents, or login credentials.</li><li>If accounts are enabled, users should be able to request deletion by report ID or through admin contact.</li><li>For minors and students, collect the minimum profile data: age group, region, and interests—not exact birthdate or school ID.</li></ul><p>We do not overpromise security. No system can guarantee perfect detection or perfect anonymity, so users should remove personal data before using any report workflow.</p></section></main>; }

function App() {
  const [page, setPage] = useState(location.hash.replace('#', '') || 'home');
  const views: Record<string, ReactNode> = { home: <Landing setPage={setPage} />, checker: <Checker />, cases: <CasesPage />, report: <ReportPage />, dashboard: <Dashboard />, methodology: <Methodology />, privacy: <Privacy /> };
  return <><Nav page={page} setPage={setPage} />{views[page] || views.home}<footer><p>Cross-Border Scam Safety for International Students · Educational MVP · Verify through official channels.</p></footer></>;
}

createRoot(document.getElementById('root')!).render(<App />);
