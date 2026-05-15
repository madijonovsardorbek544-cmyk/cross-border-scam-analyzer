import { ShieldCheck } from 'lucide-react';
import { pages } from '../data/appData';

export function Nav({ page, setPage }: { page: string; setPage: (page: string) => void }) {
  return (
    <header className="nav">
      <a className="brand" href="#home" onClick={() => setPage('home')} aria-label="Cross-Border Scam Safety home">
        <ShieldCheck /> <span>Cross-Border Scam Safety</span>
      </a>
      <nav aria-label="Primary navigation">
        {pages.map((link) => (
          <a key={link} className={page === link ? 'active' : ''} href={`#${link}`} onClick={() => setPage(link)}>
            {link}
          </a>
        ))}
      </nav>
    </header>
  );
}
