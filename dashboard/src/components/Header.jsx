import { useState, useEffect } from 'react';
import { Sun, Moon, Settings } from 'lucide-react';

export default function Header() {
  const [rpcUrl, setRpcUrl] = useState(import.meta.env.VITE_RPC_BASE_URL || 'http://localhost:8080');
  const [isEditingRpc, setIsEditingRpc] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleRpcSubmit = (e) => {
    e.preventDefault();
    setIsEditingRpc(false);
    // In a real app, you might want to validate the URL here
  };

  return (
    <header className="glass-card p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-pink)] bg-clip-text text-transparent">
            Modular Blockchain Framework
          </h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-[var(--bg-secondary)] rounded-full text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-[var(--text-secondary)]">Online</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[var(--text-secondary)]" />
            <span className="text-sm text-[var(--text-secondary)]">RPC:</span>
            {isEditingRpc ? (
              <form onSubmit={handleRpcSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={rpcUrl}
                  onChange={(e) => setRpcUrl(e.target.value)}
                  className="input-field text-sm w-48"
                  autoFocus
                />
                <button type="submit" className="btn-secondary text-sm px-3 py-1">
                  Save
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsEditingRpc(true)}
                className="text-sm text-[var(--accent-teal)] hover:underline font-mono"
                aria-label="Edit RPC URL"
              >
                {rpcUrl}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}