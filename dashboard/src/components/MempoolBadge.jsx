import { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { getMempool } from '../lib/rpc';
import { motion } from 'framer-motion';

export default function MempoolBadge({ rpcUrl }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMempoolCount = async () => {
      setLoading(true);
      try {
        const transactions = await getMempool(rpcUrl);
        setPendingCount(transactions.length);
      } catch (error) {
        console.error('Failed to fetch mempool:', error);
        setPendingCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchMempoolCount();
    const interval = setInterval(fetchMempoolCount, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [rpcUrl]);

  if (pendingCount === 0 && !loading) {
    return null; // Don't show badge if no pending transactions
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed top-20 right-6 z-50"
    >
      <motion.div
        className="glass-card p-3 flex items-center gap-2 cursor-pointer hover:bg-[var(--bg-card)] transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={pendingCount > 0 ? { scale: [1, 1.1, 1] } : {}}
        transition={{
          scale: pendingCount > 0 ? { repeat: Infinity, duration: 2 } : {}
        }}
      >
        <div className="relative">
          <Clock className="w-5 h-5 text-[var(--accent-pink)]" />
          {pendingCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--accent-pink)] rounded-full flex items-center justify-center"
            >
              <span className="text-xs text-white font-bold">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            </motion.div>
          )}
        </div>
        <div className="text-sm">
          <div className="font-medium text-[var(--text-primary)]">
            {loading ? '...' : pendingCount} Pending
          </div>
          <div className="text-xs text-[var(--text-secondary)]">
            {loading ? 'Loading...' : 'In Mempool'}
          </div>
        </div>
        {pendingCount > 5 && (
          <AlertCircle className="w-4 h-4 text-yellow-400" />
        )}
      </motion.div>
    </motion.div>
  );
}