import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Hash, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BlockCard({ block, isExpanded, onToggle }) {
  const formatTimeAgo = (timestamp) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <motion.div
      layout
      className="glass-card p-4 cursor-pointer hover:bg-[var(--bg-card)] transition-colors"
      onClick={onToggle}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent-teal)] to-[var(--accent-pink)] rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Block #{block.number}</h3>
            <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTimeAgo(block.timestamp)}
              </span>
              <span className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                {block.transactions?.length || 0} tx
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs text-[var(--text-secondary)]">Prev Hash</div>
            <div className="terminal-font text-xs font-mono">
              {block.prevHash?.slice(0, 8)}...
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-[var(--accent-teal)]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[var(--accent-teal)]" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-[var(--border)]"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-[var(--accent-teal)]">Block Details</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Number:</span>
                    <span className="terminal-font">{block.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Timestamp:</span>
                    <span>{new Date(block.timestamp * 1000).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Prev Hash:</span>
                    <span className="terminal-font text-xs break-all">{block.prevHash}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Hash:</span>
                    <span className="terminal-font text-xs break-all">{block.hash}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Nonce:</span>
                    <span className="terminal-font">{block.nonce}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-[var(--accent-teal)]">Transactions ({block.transactions?.length || 0})</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {block.transactions?.length > 0 ? (
                    block.transactions.map((tx, idx) => (
                      <div key={idx} className="bg-[var(--bg-secondary)] p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="w-4 h-4 text-[var(--accent-pink)]" />
                          <span className="terminal-font text-xs font-mono">
                            {tx.id?.slice(0, 12)}...
                          </span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">From:</span>
                            <span className="terminal-font">{tx.from?.slice(0, 12)}...</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">To:</span>
                            <span className="terminal-font">{tx.to?.slice(0, 12)}...</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">Amount:</span>
                            <span className="text-[var(--accent-teal)] font-semibold">{tx.amount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">Nonce:</span>
                            <span className="terminal-font">{tx.nonce}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[var(--text-secondary)] text-sm text-center py-4">
                      No transactions in this block
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}