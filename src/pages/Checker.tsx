import { useState } from 'react';
import { analyzeMessage, validateCheckInput } from '../analyzer';
import { blankInput } from '../data/appData';
import { demoMessages } from '../data/demoMessages';
import type { CheckInput, CheckResult } from '../types';
import { DemoMessageSelector } from '../components/DemoMessageSelector';
import { InputGrid } from '../components/InputGrid';
import { ResultCard } from '../components/ResultCard';

export function Checker() {
  const [input, setInput] = useState<CheckInput>(blankInput);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [demoId, setDemoId] = useState('');
  const errors = validateCheckInput(input);
  const useDemo = (id: string) => { const demo = demoMessages.find((item) => item.id === id); if (demo) { setDemoId(id); setInput(demo.input); setResult(null); } };
  const reset = () => { setInput({ ...blankInput, message: '' }); setResult(null); setDemoId(''); };
  return <main className="stack"><section className="panel"><p className="eyebrow">Free student checker</p><h1>Analyze risk indicators before you pay, click, or share documents.</h1><p className="notice">Educational tool only. It detects risk indicators, not certainty. Analysis runs locally in this browser unless you choose the separate redacted reporting flow.</p><DemoMessageSelector demoId={demoId} onSelect={useDemo} /><label>Suspicious message<textarea value={input.message} maxLength={5000} onChange={(e: { target: HTMLTextAreaElement }) => setInput({ ...input, message: e.target.value })} placeholder="Paste message text. Do not paste passport scans, card numbers, passwords, or private documents." /></label><InputGrid input={input} setInput={setInput} />{errors.length > 0 && <div className="errors"><strong>Before analysis:</strong><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}<div className="actions"><button disabled={errors.length > 0} onClick={() => setResult(analyzeMessage(input))}>Analyze risk indicators</button><button className="ghost" onClick={reset}>Clear</button></div></section>{result && <ResultCard result={result} input={input} onReset={reset} />}</main>;
}
