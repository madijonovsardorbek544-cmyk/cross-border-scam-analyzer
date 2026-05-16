import { useMemo, useState } from 'react';
import { BarChart3, Library, School, ShieldCheck } from 'lucide-react';
import { sampleReports } from '../data/appData';
import { resourcePacks } from '../data/resourcePacks';
import { readLocalFeedback, type AnonymousFeedbackRecord } from '../lib/feedback/feedbackSchema';
import { readLocalReports } from '../lib/privacy/reportSchema';
import type { AnonymizedReportPayload } from '../types';
import { Chart } from '../components/Chart';
import { Metric } from '../components/Metric';

type SourceMode = 'sample' | 'local' | 'firebase';

function countBy<T>(items: T[], pick: (item: T) => string | undefined): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => { const key = pick(item) || 'unknown'; acc[key] = (acc[key] ?? 0) + 1; return acc; }, {});
}

function topLabels(data: Record<string, number>, limit: number): string[] {
  return Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([label, count]) => `${label} (${count})`);
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

function buildDecisionSupport(reports: AnonymizedReportPayload[], feedback: AnonymousFeedbackRecord[], mode: SourceMode) {
  const topContexts = topLabels(countBy(reports, (r) => r.context), 3);
  const topScams = topLabels(countBy(reports, (r) => r.scamTypeGuess), 3);
  const highCritical = reports.filter((r) => ['high', 'critical'].includes(r.level));
  const missingContexts = ['visa', 'payment', 'housing', 'scholarship', 'test registration'].filter((context) => !reports.some((report) => report.context === context));
  const unreviewedPacks = resourcePacks.filter((pack) => pack.requiredInstitutionReview);
  const missedRisk = feedback.filter((f) => f.category === 'missed risk' || f.calibration === 'too low');
  const falsePositive = feedback.filter((f) => f.category === 'false alarm' || f.calibration === 'too high');

  return {
    thisWeek: [
      highCritical.length ? `Review ${highCritical.length} high/critical report trend(s) and confirm official scripts for the top categories.` : 'Add pilot data or run a tabletop review; there are no high/critical report trends in the selected source.',
      missedRisk.length ? `Inspect ${missedRisk.length} missed-risk feedback item(s) without requesting raw messages.` : 'Ask counselors to submit structured feedback after reviewing student reports.',
      mode === 'sample' ? 'Replace sample data with local pilot data before making operational decisions.' : mode === 'firebase' ? 'Firebase dashboard querying is not implemented in this MVP; do not make operational decisions from this mode.' : 'Export local-only findings for the pilot owner; local browser data is not an institutional system of record.',
    ],
    studentWarnings: (topScams.length ? topScams : topContexts).map((item) => `Send a calm verification reminder for ${item}: type official sites manually and do not share OTPs, passwords, card details, or passport scans in chats.`).slice(0, 3),
    counselorActions: [
      'Verify payment, visa, housing, testing, and agent messages against institution-owned contacts before advising students to act.',
      'Record only structured outcomes such as risk level, category, and verified/not verified status; avoid raw message collection.',
      falsePositive.length ? `Review ${falsePositive.length} false-alarm signal(s) for calibration notes.` : 'Collect false-alarm feedback when legitimate messages score too high.',
    ],
    resourceGaps: [
      ...missingContexts.map((context) => `No selected-window report trend for ${context}; confirm whether the pilot needs a local resource/script anyway.`),
      ...unreviewedPacks.slice(0, 3).map((pack) => `${pack.title} still requires institution review of official links and scripts.`),
    ].slice(0, 6),
    dataQualityWarnings: [
      `Data source is ${mode}: ${mode === 'sample' ? 'synthetic sample data only' : mode === 'local' ? 'local browser reports and feedback only' : 'Firebase querying is not connected in this MVP; project configuration and governance must be reviewed'}.`,
      reports.length === 0 ? 'No reports are available for the selected range/source, so charts may understate risk.' : 'Counts are small MVP trend indicators, not prevalence or accuracy metrics.',
      'Feedback records intentionally exclude raw, redacted, or original message text by schema.',
    ],
  };
}

function buildReport(reports: AnonymizedReportPayload[], feedback: AnonymousFeedbackRecord[], mode: SourceMode) {
  const top = (data: Record<string, number>) => Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `- ${k}: ${v}`).join('\n') || '- No data';
  const support = buildDecisionSupport(reports, feedback, mode);
  return `# Cross-Border Scam Safety Pilot Report\n\nData source: **${mode}** (${mode === 'sample' ? 'not real institution data' : mode === 'local' ? 'local browser data only' : 'Firebase dashboard querying not connected in this MVP'})\n\n## Summary\n- Reports reviewed: ${reports.length}\n- High/critical reports: ${reports.filter((r) => ['high', 'critical'].includes(r.level)).length}\n- Anonymous feedback items: ${feedback.length}\n\n## Top scam categories\n${top(countBy(reports, (r) => r.scamTypeGuess))}\n\n## Top channels\n${top(countBy(reports, (r) => r.platform))}\n\n## Top authorities\n${top(countBy(reports, (r) => r.claimedAuthority || 'not specified'))}\n\n## What should the institution do this week?\n${support.thisWeek.map((x) => `- ${x}`).join('\n')}\n\n## Top 3 student warnings to send\n${support.studentWarnings.map((x) => `- ${x}`).join('\n') || '- No trend-specific warning available yet.'}\n\n## Top 3 counselor actions\n${support.counselorActions.map((x) => `- ${x}`).join('\n')}\n\n## Resource gaps\n${support.resourceGaps.map((x) => `- ${x}`).join('\n') || '- No immediate resource gaps found in this small dataset.'}\n\n## Data quality warnings\n${support.dataQualityWarnings.map((x) => `- ${x}`).join('\n')}\n`;
}

function DecisionList({ title, items }: { title: string; items: string[] }) {
  return <article><h2>{title}</h2><ul>{items.length ? items.map((item) => <li key={item}>{item}</li>) : <li>No trend-specific item available yet.</li>}</ul></article>;
}

export function Dashboard() {
  const [sourceMode, setSourceMode] = useState<SourceMode>('sample');
  const [days, setDays] = useState(30);
  const localFeedback = typeof window !== 'undefined' ? readLocalFeedback() : [];
  const localReports = typeof window !== 'undefined' ? readLocalReports() : [];
  const reports = useMemo(() => {
    const cutoff = Date.now() - days * 86400000;
    const base = sourceMode === 'sample' ? sampleReports : sourceMode === 'local' ? localReports : [];
    return base.filter((r) => new Date(r.createdAtIso).getTime() >= cutoff);
  }, [days, sourceMode, localReports]);
  const feedback = localFeedback.filter((f) => Date.now() - new Date(f.createdAtIso).getTime() <= days * 86400000);
  const falsePositive = feedback.filter((f) => f.category === 'false alarm' || f.calibration === 'too high');
  const missedRisk = feedback.filter((f) => f.category === 'missed risk' || f.calibration === 'too low');
  const interventions = countBy(reports, (r) => r.context === 'visa' ? 'Visa verification warnings' : r.context === 'housing' ? 'Housing deposit checklist' : r.context === 'scholarship' ? 'Scholarship fee warning' : r.context === 'test registration' ? 'Testing-provider verification' : r.context === 'payment' ? 'Official payment-channel reminder' : 'General verification script');
  const decisionSupport = buildDecisionSupport(reports, feedback, sourceMode);

  return <main className="stack"><section className="panel"><p className="eyebrow">Institution dashboard</p><h1>Pilot-ready trend review with clear data-source labeling.</h1><p className="warning">Current mode: <strong>{sourceMode}</strong>. {sourceMode === 'sample' ? 'This is synthetic/sample data, not real institution data.' : sourceMode === 'local' ? 'This browser shows locally saved redacted reports and structured feedback only; no raw messages are included.' : 'Firebase dashboard querying is not connected in this MVP. Configure Firestore queries, authentication, rules, retention, and review before production use.'}</p><div className="form-grid"><label>Date range<select value={days} onChange={(e: { target: HTMLSelectElement }) => setDays(Number(e.target.value))}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select></label><label>Report source mode<select value={sourceMode} onChange={(e: { target: HTMLSelectElement }) => setSourceMode(e.target.value as SourceMode)}><option value="sample">sample</option><option value="local">local</option><option value="firebase">Firebase</option></select></label></div><button onClick={() => downloadMarkdown('cross-border-scam-safety-pilot-report.md', buildReport(reports, feedback, sourceMode))}><Library /> Download Markdown report</button></section><section className="grid four"><Metric title="Reports" value={reports.length} icon={<BarChart3 />} /><Metric title="High/Critical" value={reports.filter((r) => ['high', 'critical'].includes(r.level)).length} icon={<ShieldCheck />} /><Metric title="Feedback" value={feedback.length} icon={<School />} /><Metric title="Missed-risk signals" value={missedRisk.length} icon={<BarChart3 />} /></section><section className="grid two"><DecisionList title="What should the institution do this week?" items={decisionSupport.thisWeek} /><DecisionList title="Top 3 student warnings to send" items={decisionSupport.studentWarnings} /><DecisionList title="Top 3 counselor actions" items={decisionSupport.counselorActions} /><DecisionList title="Resource gaps" items={decisionSupport.resourceGaps} /><DecisionList title="Data quality warnings" items={decisionSupport.dataQualityWarnings} /></section><section className="grid two"><Chart title="Top scam categories" data={countBy(reports, (r) => r.scamTypeGuess)} /><Chart title="Top channels" data={countBy(reports, (r) => r.platform)} /><Chart title="Top authorities" data={countBy(reports, (r) => r.claimedAuthority || 'not specified')} /><Chart title="Top recommended interventions" data={interventions} /><Chart title="Feedback summary" data={countBy(feedback, (f) => f.category || f.calibration)} /><Chart title="Top false-positive categories" data={countBy(falsePositive, (f) => f.context)} /><Chart title="Top missed-risk categories" data={countBy(missedRisk, (f) => f.context)} /></section></main>;
}
