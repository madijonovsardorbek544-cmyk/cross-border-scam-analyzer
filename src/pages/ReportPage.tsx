import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { analyzeMessage } from '../analyzer';
import { blankInput, neverSubmitItems } from '../data/appData';
import { db, isFirebaseConfigured } from '../firebase';
import { createAnonymizedReportPayload } from '../lib/privacy/reportSchema';
import { redactSensitiveText } from '../redaction';
import type { CheckInput } from '../types';
import { InputGrid } from '../components/InputGrid';

export function ReportPage() {
  const [input, setInput] = useState<CheckInput>(blankInput);
  const [consent, setConsent] = useState(false);
  const [reportId, setReportId] = useState('');
  const result = input.message.trim() ? analyzeMessage(input) : null;
  const redaction = redactSensitiveText(input.message);
  const submit = async () => { if (!result || !consent) return; const payload = createAnonymizedReportPayload(input, result); if (isFirebaseConfigured && db) await addDoc(collection(db, 'reports'), { ...payload, serverCreatedAt: serverTimestamp() }); setReportId(payload.reportId); };
  return <main className="stack"><section className="panel"><p className="eyebrow">Redacted report flow</p><h1>Share anonymized scam trends without submitting raw private messages by default.</h1><p className="warning">Do not paste {neverSubmitItems.join(', ')}. Redaction is best effort; review the preview before consenting.</p><label>Message to redact<textarea value={input.message} onChange={(e: { target: HTMLTextAreaElement }) => setInput({ ...input, message: e.target.value })} /></label><InputGrid input={input} setInput={setInput} /><h2>Redacted preview</h2><pre className="preview">{redaction.redactedText || 'Preview appears here.'}</pre><p>Redactions: {Object.entries(redaction.replacements).map(([key, value]) => `${key}: ${value}`).join(', ') || 'none'}</p><label className="checkbox"><input type="checkbox" checked={consent} onChange={(e: { target: HTMLInputElement }) => setConsent(e.target.checked)} /> I reviewed the redacted preview and consent to submit only the anonymized report fields.</label><div className="actions"><button disabled={!result || !consent} onClick={submit}>Submit redacted report</button></div>{reportId && <div className="report-id"><strong>Report saved:</strong> {reportId}<br /><span>{isFirebaseConfigured ? 'Firebase configured; anonymized payload submitted.' : 'Firebase not configured; report ID created locally for demo/pilot review.'}</span></div>}</section></main>;
}
