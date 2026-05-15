import { useState } from 'react';
import { AlertTriangle, Library } from 'lucide-react';
import { copyText } from '../data/appData';
import { packsForText } from '../data/resourcePacks';
import { saveAnonymousFeedback, type FeedbackCalibration, type FeedbackCategory, type FeedbackHelpful, type FeedbackVerified } from '../lib/feedback/feedbackSchema';
import type { CheckInput, CheckResult } from '../types';
import { RiskAreaCard } from './RiskAreaCard';

function levelExplanation(result: CheckResult) {
  if (result.score >= 80) return 'Critical because the combined weighted indicators reached 80 or higher. Treat as urgent to verify, not as proof of fraud.';
  if (result.score >= 55) return 'High because the combined weighted indicators reached 55 or higher. Verify through official channels before acting.';
  if (result.score >= 28) return 'Medium because some risk indicators were present, but the score did not reach the high-risk threshold.';
  return 'Low because no strong rule combination was detected. Spoofing is still possible, so normal verification remains recommended.';
}

export function ResultCard({ result, input, onReset }: { result: CheckResult; input: CheckInput; onReset: () => void }) {
  const [analystView, setAnalystView] = useState(false);
  const [helpful, setHelpful] = useState<FeedbackHelpful>('yes');
  const [verified, setVerified] = useState<FeedbackVerified>('not yet');
  const [calibration, setCalibration] = useState<FeedbackCalibration>('accurate');
  const [category, setCategory] = useState<FeedbackCategory>('');
  const [saved, setSaved] = useState(false);
  const topReasons = [...result.detectedTactics].sort((a, b) => b.weight - a.weight).slice(0, 3);
  const visibleTactics = result.detectedTactics.filter((x) => x.id !== 'noStrongRule');
  const relatedPacks = packsForText(`${input.message} ${input.context} ${result.detectedTactics.map((x) => x.label).join(' ')}`);

  const submitFeedback = async () => {
    await saveAnonymousFeedback({ helpful, verifiedOfficialChannel: verified, calibration, category }, result, input.context, input.platform);
    setSaved(true);
  };

  return (
    <section className={`panel result ${result.level}`} aria-live="polite">
      <div className="score">
        <div>
          <p className="eyebrow">Risk indicators detected</p>
          <h2><span className="big-score">{result.score}</span>/100</h2>
          <p><strong>Risk level:</strong> {result.level.toUpperCase()} · <strong>Confidence:</strong> {result.confidenceLevel.toUpperCase()}</p>
          <p>{result.level === 'low' ? 'No strong scam pattern was detected. Stay calm and verify through official channels before acting.' : result.falsePositiveWarning}</p>
          <label className="checkbox"><input type="checkbox" checked={analystView} onChange={(e: { target: HTMLInputElement }) => setAnalystView(e.target.checked)} /> Counselor / Analyst View</label>
        </div>
        <AlertTriangle aria-hidden="true" />
      </div>

      {!analystView ? (
        <div className="grid three">
          <article><h3>Top 3 reasons</h3><ol className="checklist">{topReasons.map((x) => <li key={x.id}><strong>{x.label}</strong><br /><span>{x.description}</span>{x.evidence.length > 0 && <small> Evidence: {x.evidence.join(', ')}</small>}</li>)}</ol></article>
          <article><h3>Safe next steps</h3><ol className="checklist">{result.safeNextSteps.map((x) => <li key={x}>{x}</li>)}</ol><p className="notice">{result.trustedAdultNote}</p></article>
          <article><h3>Copyable verification script</h3><blockquote>{result.officialVerificationScript}</blockquote><button onClick={() => copyText(result.officialVerificationScript)}><Library /> Copy script</button></article>
        </div>
      ) : (
        <>
          <div className="grid two">
            <article><h3>Why this level was chosen</h3><p>{levelExplanation(result)}</p><p><strong>False-positive warning:</strong> {result.falsePositiveWarning}</p><p><strong>Authority/context check:</strong> {result.fakeAuthorityType}</p></article>
            <article><h3>Matched rules, evidence, and weights</h3><ul className="flag-list">{visibleTactics.map((x) => <li key={x.id}><strong>{x.label}</strong> (+{x.weight})<br /><span>{x.description}</span>{x.evidence.length > 0 && <small> Evidence: {x.evidence.join(', ')}</small>}</li>)}</ul></article>
          </div>
          <h3>Risk areas</h3>
          <div className="grid four"><RiskAreaCard title="Account security risk" area={result.accountSecurityRisk} /><RiskAreaCard title="Credential risk" area={result.credentialRisk} /><RiskAreaCard title="Financial account risk" area={result.financialAccountRisk} /><RiskAreaCard title="Action pressure risk" area={result.actionPressureRisk} /></div>
          <div className="grid three"><RiskAreaCard title="Payment risk" area={result.paymentRisk} /><RiskAreaCard title="Sensitive data risk" area={result.sensitiveDataRisk} /><RiskAreaCard title="Link/domain risk" area={result.linkDomainRisk} /></div>
          <article><h3>Combination boosts</h3><ul>{visibleTactics.filter((x) => x.id.startsWith('combo')).map((x) => <li key={x.id}><strong>{x.label}</strong> (+{x.weight}) — {x.description}</li>)}</ul>{visibleTactics.every((x) => !x.id.startsWith('combo')) && <p className="muted">No combination boost matched.</p>}</article>
        </>
      )}

      {relatedPacks.length > 0 && <section className="panel"><h3>Relevant official resource packs</h3><div className="grid three">{relatedPacks.map((pack) => <article key={pack.id}><h4>{pack.title}</h4><p>{pack.whoItHelps.join(', ')}</p><p><strong>Verify:</strong> {pack.officialVerificationSteps[0]}</p><blockquote>{pack.safeScript}</blockquote></article>)}</div></section>}

      <section className="panel">
        <h3>Anonymous feedback</h3>
        <p className="muted">Stored locally by default; if Firebase is configured, only this structured feedback is submitted. The raw message is never stored in feedback.</p>
        <div className="form-grid">
          <label>Was this helpful?<select value={helpful} onChange={(e: { target: HTMLSelectElement }) => setHelpful(e.target.value as FeedbackHelpful)}><option>yes</option><option>no</option></select></label>
          <label>Verified officially?<select value={verified} onChange={(e: { target: HTMLSelectElement }) => setVerified(e.target.value as FeedbackVerified)}><option>not yet</option><option>yes</option><option>no</option></select></label>
          <label>Risk felt<select value={calibration} onChange={(e: { target: HTMLSelectElement }) => setCalibration(e.target.value as FeedbackCalibration)}><option>accurate</option><option>too low</option><option>too high</option></select></label>
          <label>Optional category<select value={category} onChange={(e: { target: HTMLSelectElement }) => setCategory(e.target.value as FeedbackCategory)}><option value="">Prefer not to say</option><option>missed risk</option><option>false alarm</option><option>unclear wording</option><option>useful</option></select></label>
        </div>
        <div className="actions"><button onClick={submitFeedback} disabled={saved}>{saved ? 'Feedback saved' : 'Save anonymous feedback'}</button><button className="ghost" onClick={onReset}>Analyze another message</button></div>
      </section>
    </section>
  );
}
