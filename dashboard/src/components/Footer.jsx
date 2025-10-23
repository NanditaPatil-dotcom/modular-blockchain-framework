import { Github, ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass-card p-6 mt-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">

        <div className="flex items-center gap-6">
          <a
            href="https://github.com/your-repo/modular-blockchain-framework"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[var(--accent-teal)] hover:text-[var(--accent-pink)] transition-colors"
          >
            <Github className="w-4 h-4" />
            View Source
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="text-sm text-[var(--text-secondary)]">
            © {currentYear} Modular Blockchain Framework
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--text-secondary)]">
          <span>Status: <span className="text-green-400">● Online</span></span>
        </div>
      </div>
    </footer>
  );
}