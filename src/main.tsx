import { useEffect, useState } from 'react';
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
import { currentHashRoute, normalizeHashRoute, setHashRoute, type AppRoute } from './lib/routes';
import './styles.css';

export function App() {
  const [page, setPageState] = useState<AppRoute>(currentHashRoute());

  const setPage = (nextPage: AppRoute) => {
    setHashRoute(nextPage);
    setPageState(nextPage);
  };

  useEffect(() => {
    const syncRoute = () => {
      const nextPage = currentHashRoute();
      const normalizedHash = `#${nextPage}`;
      if (window.location.hash && normalizeHashRoute(window.location.hash) === 'home' && window.location.hash !== '#home') {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${normalizedHash}`);
      }
      setPageState(nextPage);
    };

    syncRoute();
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);
    return () => {
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('popstate', syncRoute);
    };
  }, []);

  const render = () => ({
    home: <Landing setPage={setPage} />,
    checker: <Checker />,
    cases: <CaseLibrary />,
    report: <ReportPage />,
    dashboard: <Dashboard />,
    pilot: <PilotPage />,
    methodology: <Methodology />,
    privacy: <PrivacyPage />,
    eval: <EvalDashboard />,
  }[page] ?? <Landing setPage={setPage} />);

  return <><Nav page={page} setPage={setPage} />{render()}<footer><Library /> Public MVP foundation for validation with education partners. Risk indicators detected ≠ certainty.</footer></>;
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
