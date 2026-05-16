import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { analyzeMessage } from '../analyzer';
import { blankInput, copyText, neverSubmitItems } from '../data/appData';
import { db, isFirebaseConfigured } from '../firebase';
import { createAnonymizedReportPayload, saveLocalReport } from '../lib/privacy/reportSchema';
import { removeUndefinedFields } from '../lib/privacy/payloadSanitizer';
import { redactSensitiveText } from '../redaction';
import type { CheckInput } from '../types';
import { InputGrid } from '../components/InputGrid';

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export function ReportPage() {
  const [input, setInput] = useState<CheckInput>(blankInput);
  const [consent, setConsent] = useState(false);
  const [reportId, setReportId] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [storageMode, setStorageMode] = useState<'local' | 'firebase' | null>(null);
  const [message, setMessage] = useState('');
  const result = input.message.trim() ? analyzeMessage(input) : null;
  const redaction = redactSensitiveText(input.message);

  const clearForm = () => {
    setInput({ ...blankInput, message: '' });
    setConsent(false);
    setReportId('');
    setStatus('idle');
    setStorageMode(null);
    setMessage('');
  };

  const submit = async () => {
    if (!result || !consent || status === 'submitting') return;
    setStatus('submitting');
    setMessage('');
    const payload = createAnonymizedReportPayload(input, result);

    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'reports'), removeUndefinedFields({ ...payload, createdAt: serverTimestamp() }));
        setReportId(payload.reportId);
        setStorageMode('firebase');
        setStatus('success');
        setMessage('Redacted report submitted to Firebase. No raw message field was included in the submitted payload.');
        return;
      } catch (error) {
        saveLocalReport(payload);
        setReportId(payload.reportId);
        setStorageMode('local');
        setStatus('error');
        setMessage(`Firebase submission failed, so the redacted report was saved only in this browser. Error: ${error instanceof Error ? error.message : 'Unknown Firebase error'}`);
        return;
      }
    }

    saveLocalReport(payload);
    setReportId(payload.reportId);
    setStorageMode('local');
    setStatus('success');
    setMessage('Firebase is not configured. The redacted report was saved only in this browser for local pilot review.');
  };

  return <main className="stack"><section className="panel"><p className="eyebrow">Redacted report flow</p><h1>Share anonymized scam trends without submitting raw private messages by default.</h1><p className="warning">Do not paste {neverSubmitItems.join(', ')}. Redaction is best effort; review the preview before consenting.</p><label>Message to redact<textarea value={input.message} onChange={(e: { target: HTMLTextAreaElement }) => setInput({ ...input, message: e.target.value })} /></label><InputGrid input={input} setInput={setInput} /><h2>Redacted preview</h2><pre className="preview">{redaction.redactedText || 'Preview appears here.'}</pre><p>Redactions: {Object.entries(redaction.replacements).map(([key, value]) => `${key}: ${value}`).join(', ') || 'none'}</p><label className="checkbox"><input type="checkbox" checked={consent} onChange={(e: { target: HTMLInputElement }) => setConsent(e.target.checked)} /> I reviewed the redacted preview and consent to submit only the anonymized report fields.</label><div className="actions"><button disabled={!result || !consent || status === 'submitting'} onClick={submit}>{status === 'submitting' ? 'Submitting…' : 'Submit redacted report'}</button><button className="ghost" onClick={clearForm}>Clear form</button></div>{message && <div className={status === 'error' ? 'errors' : 'notice'}><strong>{status === 'error' ? 'Submission notice:' : 'Report status:'}</strong> {message}</div>}{reportId && <div className="report-id"><strong>Report saved:</strong> {reportId}<br /><span>{storageMode === 'firebase' ? 'Firebase configured; anonymized payload submitted.' : 'Local browser storage only; this is not an institutional system of record.'}</span><div className="actions"><button className="ghost" onClick={() => copyText(reportId)}>Copy report ID</button></div></div>}</section></main>;
}
