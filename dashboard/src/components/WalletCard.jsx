import React, { useEffect, useState, useCallback } from "react";
import usePolling from "../hooks/usePolling";
import { getBalance, requestFaucet, resetBalance } from "../lib/rpc";
import { Copy, RefreshCw, Plus } from "lucide-react"; // if using lucide-react

export default function WalletCard({ initialAddress = "" }) {
  const savedKey = typeof window !== "undefined" && localStorage.getItem("walletAddress");
  const address = initialAddress || savedKey || "";
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchBalance = useCallback(async () => {
    if (!address) { setBalance(0); return; }
    try {
      setLoading(true);
      const b = await getBalance(address);
      setBalance(b);
      setError(null);
    } catch (e) {
      setError(e.message || "balance fetch failed");
    } finally { setLoading(false); }
  }, [address]);

  // poll every 5s
  usePolling(fetchBalance, 5000);

  // initial fetch on mount
  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  const onFaucet = async () => {
    if (!address) {
      setToast("No address — create/import a wallet first");
      return;
    }
    setFaucetLoading(true);
    try {
      const data = await requestFaucet(address);
      setToast(`Faucet: +${data.amount} → ${address}`);
      // Immediately refresh balance
      await fetchBalance();
    } catch (e) {
      setToast("Faucet error: " + (e.message || e));
    } finally { setFaucetLoading(false); setTimeout(()=>setToast(null), 4000); }
  };

  const onResetWallet = async () => {
    if (!address) {
      setToast("No address — create/import a wallet first");
      return;
    }
    setResetLoading(true);
    try {
      await resetBalance(address);
      setToast("Wallet balance reset to 0");
      // Immediately refresh balance
      await fetchBalance();
    } catch (e) {
      setToast("Reset error: " + (e.message || e));
    } finally { setResetLoading(false); setTimeout(()=>setToast(null), 4000); }
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setToast("Address copied!");
      setTimeout(()=>setToast(null), 2000);
    } catch {
      setToast("Copy failed");
      setTimeout(()=>setToast(null), 2000);
    }
  };

  const createWallet = () => {
    const newAddress = '0x' + Math.random().toString(16).substr(2, 40);
    localStorage.setItem("walletAddress", newAddress);
    setToast("New wallet created!");
    setTimeout(()=>setToast(null), 2000);
    window.location.reload();
  };

  return (
    <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-sm p-4 rounded-2xl shadow-lg w-full max-w-md">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm text-slate-300">Wallet</h3>
          <div className="flex items-center gap-2 mt-1">
            <code className="font-mono text-xs text-slate-200 truncate">{address || "— no wallet —"}</code>
            <button aria-label="copy address" onClick={onCopy} className="p-1 rounded hover:bg-slate-700/30">
              <Copy size={14} />
            </button>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400">Balance</p>
          <p className="text-lg font-semibold text-teal-300">
            {loading ? "…" : (balance ?? 0)} <span className="text-sm text-slate-400">testC</span>
          </p>
          <button aria-label="refresh balance" onClick={fetchBalance} className="mt-2 inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-800/40 hover:bg-slate-800/60">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {!address && (
          <button onClick={createWallet} className="px-3 py-2 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-sm">
            <Plus size={14} className="inline mr-1" /> Create Wallet
          </button>
        )}
        {address && (
          <>
            <button onClick={onFaucet} disabled={faucetLoading} className="px-3 py-2 rounded bg-teal-400/10 hover:bg-teal-400/20 text-teal-300 text-sm">
              {faucetLoading ? "Requesting…" : "Get testcoins (Faucet)"}
            </button>

            <button onClick={onResetWallet} disabled={resetLoading} className="px-3 py-2 rounded bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 text-sm">
              {resetLoading ? "Resetting…" : "Reset wallet"}
            </button>
          </>
        )}
      </div>

      {toast && <div className="mt-3 text-xs text-slate-200 bg-slate-900/40 p-2 rounded">{toast}</div>}
      {error && <div className="mt-2 text-xs text-red-400">{error}</div>}
    </div>
  );
}