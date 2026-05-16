import { useMemo } from 'react';
import { AlertTriangle, BarChart3, Library, ShieldCheck } from 'lucide-react';
import { Chart } from '../components/Chart';
import { Metric } from '../components/Metric';
import { runEvaluationBenchmark } from '../evaluation/runEvaluation';

function topEntries(data: Record<string, number>, limit = 8) {
  return Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, limit);
}

export function EvalDashboard() {
  const summary = useMemo(() => runEvaluationBenchmark(), []);
  const failedTactics = topEntries(summary.failedExpectedTactics, 10);

  return (
    <main className="stack">
      <section className="panel">
        <p className="eyebrow">Internal evaluation dashboard</p>
        <h1>Analyzer benchmark review for the project owner.</h1>
        <p className="warning">
          This route runs the local benchmark in the browser with synthetic/labeled examples from the repository. It does not upload data, certify fraud detection, or claim real-world accuracy.
        </p>
      </section>

      <section className="grid four">
        <Metric title="Total examples" value={summary.totalExamples} icon={<Library />} />
        <Metric title="High-risk scored low" value={summary.highRiskScoredLow} icon={<ShieldCheck />} />
        <Metric title="Low-risk scored high/critical" value={summary.lowRiskScoredHighOrCritical} icon={<AlertTriangle />} />
        <Metric title="Failed examples" value={summary.failedExamples.length} icon={<BarChart3 />} />
      </section>

      <section className="grid two">
        <Chart title="Examples by category" data={summary.byCategory} />
        <Chart title="Examples by expected risk level" data={summary.byExpectedRiskLevel} />
        <Chart title="Average score by category" data={summary.averageScoreByCategory} />
        <article className="panel">
          <h2>Weakest categories</h2>
          {summary.weakestCategories.length ? (
            <ul>
              {summary.weakestCategories.map((item) => (
                <li key={item.category}>{item.category}: {item.failures}/{item.total} failed ({Math.round(item.failureRate * 100)}%)</li>
              ))}
            </ul>
          ) : <p>No failed categories in the current test assertions.</p>}
        </article>
      </section>

      <section className="grid two">
        <article className="panel">
          <h2>Failed expected tactics</h2>
          {failedTactics.length ? (
            <ul>{failedTactics.map(([label, count]) => <li key={label}>{label}: {count}</li>)}</ul>
          ) : <p>No expected tactic failures in the current benchmark run.</p>}
        </article>
        <article className="panel">
          <h2>Interpretation guardrails</h2>
          <ul>
            <li>Failures are assertion mismatches against labeled synthetic examples, not field accuracy rates.</li>
            <li>Low false-negative counts here do not guarantee real-world scam detection.</li>
            <li>Any new institution pilot should add local examples before relying on trend reporting.</li>
          </ul>
        </article>
      </section>

      <section className="panel">
        <h2>Failed examples: expected vs actual</h2>
        {summary.failedExamples.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Category</th><th>Expected</th><th>Actual</th><th>Reasons</th></tr></thead>
              <tbody>
                {summary.failedExamples.map((item) => (
                  <tr key={item.example.id}>
                    <td>{item.example.id}</td>
                    <td>{item.example.category}</td>
                    <td>{item.example.expectedLevel} / {item.example.expectedMinScore}-{item.example.expectedMaxScore ?? 100}</td>
                    <td>{item.actualLevel} / {item.actualScore}</td>
                    <td>{item.failedReasons.join(' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p>All examples currently pass the benchmark assertions.</p>}
      </section>
    </main>
  );
}
