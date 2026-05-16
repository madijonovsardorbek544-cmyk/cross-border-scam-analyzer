import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Library } from 'lucide-react';
import { Nav } from './components/Nav';
import { Landing } from './pages/Landing';
import { Checker } from './pages/Checker';
import { CaseLibrary } from './pages/CaseLibrary';
import { ReportPage } from './pages/ReportPage';
import { Dashboard } from './pages/Dashboard';
import { PilotPage } from './pages/PilotPage';
import { Methodology } from './pages/Methodology';
import { PrivacyPage } from './pages/PrivacyPage';
import { EvalDashboard } from './pages/EvalDashboard';
import './styles.css';

function App() {
  const [page, setPage] = useState<string>(window.location.hash.replace('#', '') || 'home');
  const render = () => ({ home: <Landing setPage={setPage} />, checker: <Checker />, cases: <CaseLibrary />, report: <ReportPage />, dashboard: <Dashboard />, pilot: <PilotPage />, methodology: <Methodology />, privacy: <PrivacyPage />, eval: <EvalDashboard /> }[page] ?? <Landing setPage={setPage} />);
  return <><Nav page={page} setPage={setPage} />{render()}<footer><Library /> Public MVP foundation for validation with education partners. Risk indicators detected ≠ certainty.</footer></>;
}

createRoot(document.getElementById('root')!).render(<App />);
