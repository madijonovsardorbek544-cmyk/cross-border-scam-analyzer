import { useMemo, useState } from 'react';
import { BarChart3, Library, School, ShieldCheck } from 'lucide-react';
import { sampleReports } from '../data/appData';
import { readLocalFeedback, type AnonymousFeedbackRecord } from '../lib/feedback/feedbackSchema';
import type { AnonymizedReportPayload } from '../types';
import { Chart } from '../components/Chart';
import { Metric } from '../components/Metric';

type SourceMode = 'sample' | 'local' | 'firebase';

function countBy<T>(items: T[], pick: (item: T) => string | undefined): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => { const key = pick(item) || 'unknown'; acc[key] = (acc[key] ?? 0) + 1; return acc; }, {});
}

function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildReport(reports: AnonymizedReportPayload[], feedback: AnonymousFeedbackRecord[], mode: SourceMode) {
  const top = (data: Record<string, number>) => Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `- ${k}: ${v}`).join('\n') || '- No data';
  return `# Cross-Border Scam Safety Pilot Report\n\nData source: **${mode}** (${mode === 'sample' ? 'not real institution data' : mode === 'local' ? 'local browser data only' : 'Firebase configured data review required'})\n\n## Summary\n- Reports reviewed: ${reports.length}\n- High/critical reports: ${reports.filter((r) => ['high', 'critical'].includes(r.level)).length}\n- Anonymous feedback items: ${feedback.length}\n\n## Top scam categories\n${top(countBy(reports, (r) => r.scamTypeGuess))}\n\n## Top channels\n${top(countBy(reports, (r) => r.platform))}\n\n## Top authorities\n${top(countBy(reports, (r) => r.claimedAuthority || 'not specified'))}\n\n## Feedback insights\n${top(countBy(feedback, (f) => f.category || 'uncategorized'))}\n\n## Recommended student warnings\n- Verify visa, scholarship, housing, testing, and payment requests through official websites typed manually.\n- Do not share OTPs, passwords, passport scans, card details, or portal credentials in chats.\n- Pause when messages combine urgency, payment, account lock, or document threats.\n\n## Counselor action checklist\n- Review false-alarm and missed-risk feedback weekly.\n- Update local official links and scripts before awareness sessions.\n- Escalate urgent threats to the institution's student support and safety channels.\n- Track false positives/false negatives without collecting raw sensitive messages.\n`;
}

export function Dashboard() {
  const [sourceMode, setSourceMode] = useState<SourceMode>('sample');
  const [days, setDays] = useState(30);
  const localFeedback = typeof window !== 'undefined' ? readLocalFeedback() : [];
  const reports = useMemo(() => {
    const cutoff = Date.now() - days * 86400000;
    const base = sourceMode === 'sample' ? sampleReports : [];
    return base.filter((r) => new Date(r.createdAtIso).getTime() >= cutoff);
  }, [days, sourceMode]);
  const feedback = localFeedback.filter((f) => Date.now() - new Date(f.createdAtIso).getTime() <= days * 86400000);
  const falsePositive = feedback.filter((f) => f.category === 'false alarm' || f.calibration === 'too high');
  const missedRisk = feedback.filter((f) => f.category === 'missed risk' || f.calibration === 'too low');
  const interventions = countBy(reports, (r) => r.context === 'visa' ? 'Visa verification warnings' : r.context === 'housing' ? 'Housing deposit checklist' : r.context === 'scholarship' ? 'Scholarship fee warning' : r.context === 'test registration' ? 'Testing-provider verification' : r.context === 'payment' ? 'Official payment-channel reminder' : 'General verification script');
  return <main className="stack"><section className="panel"><p className="eyebrow">Institution dashboard</p><h1>Pilot-ready trend review with clear data-source labeling.</h1><p className="warning">Current mode: <strong>{sourceMode}</strong>. {sourceMode === 'sample' ? 'This is synthetic/sample data, not real institution data.' : sourceMode === 'local' ? 'This browser only has local feedback; no raw messages are included.' : 'Firebase mode requires configured project security review before production use.'}</p><div className="form-grid"><label>Date range<select value={days} onChange={(e: { target: HTMLSelectElement }) => setDays(Number(e.target.value))}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select></label><label>Report source mode<select value={sourceMode} onChange={(e: { target: HTMLSelectElement }) => setSourceMode(e.target.value as SourceMode)}><option value="sample">sample</option><option value="local">local</option><option value="firebase">Firebase</option></select></label></div><button onClick={() => downloadMarkdown('cross-border-scam-safety-pilot-report.md', buildReport(reports, feedback, sourceMode))}><Library /> Download Markdown report</button></section><section className="grid four"><Metric title="Reports" value={reports.length} icon={<BarChart3 />} /><Metric title="High/Critical" value={reports.filter((r) => ['high', 'critical'].includes(r.level)).length} icon={<ShieldCheck />} /><Metric title="Feedback" value={feedback.length} icon={<School />} /><Metric title="Missed-risk signals" value={missedRisk.length} icon={<BarChart3 />} /></section><section className="grid two"><Chart title="Top scam categories" data={countBy(reports, (r) => r.scamTypeGuess)} /><Chart title="Top channels" data={countBy(reports, (r) => r.platform)} /><Chart title="Top authorities" data={countBy(reports, (r) => r.claimedAuthority || 'not specified')} /><Chart title="Top recommended interventions" data={interventions} /><Chart title="Feedback summary" data={countBy(feedback, (f) => f.category || f.calibration)} /><Chart title="Top false-positive categories" data={countBy(falsePositive, (f) => f.context)} /><Chart title="Top missed-risk categories" data={countBy(missedRisk, (f) => f.context)} /></section></main>;
}
