import { useState, useEffect, useCallback } from 'react';
import { Blocks, RefreshCw } from 'lucide-react';
import { getBlocks } from '../lib/rpc';
import { motion, AnimatePresence } from 'framer-motion';
import BlockCard from './BlockCard';

interface Transaction {
  from: string;
  to: string;
  amount: number;
}

interface Block {
  index: number;
  hash: string;
  previousHash: string;
  timestamp: string;
  transactions: Transaction[];
}

export default function BlocksList({ rpcUrl }: { rpcUrl: string }) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [newBlockBanner, setNewBlockBanner] = useState(false);
  const [previousBlockCount, setPreviousBlockCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data: Block[] = await getBlocks(rpcUrl);
      // Sort blocks by index descending (newest first)
      const sortedBlocks = data.sort((a, b) => b.index - a.index);

      // Check for new blocks
      if (sortedBlocks.length > previousBlockCount) {
        setNewBlockBanner(true);
        setTimeout(() => setNewBlockBanner(false), 3000); // Hide banner after 3 seconds
      }
      setPreviousBlockCount(sortedBlocks.length);

      setBlocks(sortedBlocks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blocks');
    } finally {
      setLoading(false);
    }
  }, [rpcUrl, previousBlockCount]);

  useEffect(() => {
    fetchBlocks();
    const interval = setInterval(fetchBlocks, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [rpcUrl, fetchBlocks]);

  const toggleBlockExpansion = (blockIndex: number) => {
    setExpandedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockIndex)) {
        newSet.delete(blockIndex);
      } else {
        newSet.add(blockIndex);
      }
      return newSet;
    });
  };

  // Filter blocks based on search query
  const filteredBlocks = blocks.filter(block =>
    block.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
    block.index.toString().includes(searchQuery)
  );

  // Calculate total transactions
  const totalTransactions = blocks.reduce((sum, block) => sum + block.transactions.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      {/* New Block Banner */}
      <AnimatePresence>
        {newBlockBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-center font-semibold"
          >
            🧱 New block added to the chain!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with counters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Blocks className="w-5 h-5 text-[var(--accent-teal)]" />
          <h3 className="text-lg font-semibold">Block Explorer</h3>
        </div>
        <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
          <span>Current Block Height: {blocks.length > 0 ? Math.max(...blocks.map(b => b.index)) : 0}</span>
          <span>Total Transactions: {totalTransactions}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by block hash or number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field w-full"
        />
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
          {filteredBlocks.length > 0 ? (
            filteredBlocks.map((block, index) => (
              <motion.div
                key={block.index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                layout
              >
                <BlockCard
                  block={block}
                  isExpanded={expandedBlocks.has(block.index)}
                  onToggle={() => toggleBlockExpansion(block.index)}
                />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              {searchQuery ? 'No block found 😢' : 'No blocks available'}
            </div>
          )}
        </motion.div>
      </div>

      {blocks.length > 0 && (
        <div className="mt-4 text-center text-sm text-[var(--text-secondary)]">
          Showing {filteredBlocks.length} of {blocks.length} blocks • Auto-refreshing every 5 seconds
        </div>
      )}

      {/* Floating Refresh Button */}
      <motion.button
        onClick={fetchBlocks}
        disabled={loading}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-green)] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Refresh blocks"
      >
        <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
      </motion.button>
    </motion.div>
  );
}