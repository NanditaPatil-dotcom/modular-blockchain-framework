import { useState, useEffect, useCallback } from 'react';
import { Blocks, RefreshCw } from 'lucide-react';
import { getBlocks } from '../lib/rpc';
import { motion } from 'framer-motion';
import BlockCard from './BlockCard';

interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  nonce: number;
  signature: string;
}

interface Block {
  number: number;
  prevHash: string;
  timestamp: number;
  transactions: Transaction[];
  nonce: number;
  hash: string;
}

export default function BlocksList({ rpcUrl }: { rpcUrl: string }) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data: Block[] = await getBlocks(rpcUrl);
      // Sort blocks by number descending (newest first)
      const sortedBlocks = data.sort((a, b) => b.number - a.number);
      setBlocks(sortedBlocks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blocks');
    } finally {
      setLoading(false);
    }
  }, [rpcUrl]);

  useEffect(() => {
    fetchBlocks();
    const interval = setInterval(fetchBlocks, 20000); // Poll every 20 seconds
    return () => clearInterval(interval);
  }, [rpcUrl, fetchBlocks]);

  const toggleBlockExpansion = (blockNumber: number) => {
    setExpandedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockNumber)) {
        newSet.delete(blockNumber);
      } else {
        newSet.add(blockNumber);
      }
      return newSet;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Blocks className="w-5 h-5 text-[var(--accent-teal)]" />
          <h3 className="text-lg font-semibold">Block Explorer</h3>
        </div>
        <button
          onClick={fetchBlocks}
          disabled={loading}
          className="btn-secondary p-2"
          aria-label="Refresh blocks"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {loading && blocks.length === 0 && (
          <div className="text-center py-8">
            <div className="inline-block w-6 h-6 border-2 border-[var(--accent-teal)] border-t-transparent rounded-full animate-spin mb-2"></div>
            <div className="text-[var(--text-secondary)]">Loading blocks...</div>
          </div>
        )}

        {blocks.length === 0 && !loading && !error && (
          <div className="text-center py-8 text-[var(--text-secondary)]">
            No blocks found
          </div>
        )}

        <motion.div
          className="space-y-4"
          layout
        >
          {blocks.map((block, index) => (
            <motion.div
              key={block.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              layout
            >
              <BlockCard
                block={block}
                isExpanded={expandedBlocks.has(block.number)}
                onToggle={() => toggleBlockExpansion(block.number)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {blocks.length > 0 && (
        <div className="mt-4 text-center text-sm text-[var(--text-secondary)]">
          Showing {blocks.length} blocks • Auto-refreshing every 20 seconds
        </div>
      )}
    </motion.div>
  );
}