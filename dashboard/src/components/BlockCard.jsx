import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Hash, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BlockCard({ block, isExpanded, onToggle }) {
  const formatReadableTime = (timestamp) => {
    // Backend sends Unix timestamp in seconds, JavaScript expects milliseconds
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      layout
      className="glass-card p-4 cursor-pointer hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all duration-300"
      onClick={onToggle}
      whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(45,212,191,0.3)" }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg terminal-font">Block #{block.Number}</h3>
            <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatReadableTime(block.Timestamp)}
              </span>
              <span className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                {block.Transactions?.length || 0} tx
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs text-[var(--text-secondary)]">Hash</div>
            <div className="terminal-font text-xs font-mono">
              {block.Hash?.slice(0, 8)}...
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
                    <span className="terminal-font">{block.Number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Timestamp:</span>
                    <span>{formatReadableTime(block.Timestamp)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Hash:</span>
                    <span className="terminal-font text-xs break-all">{block.Hash}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Previous Hash:</span>
                    <span className="terminal-font text-xs break-all">{block.PrevHash}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-[var(--accent-teal)]">Transactions ({block.Transactions?.length || 0})</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {block.Transactions?.length > 0 ? (
                    block.Transactions.map((tx, idx) => (
                      <motion.div
                        key={idx}
                        className="bg-[var(--bg-secondary)] p-3 rounded-lg"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">From:</span>
                            <span className="terminal-font">{tx.From}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">To:</span>
                            <span className="terminal-font">{tx.To}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">Amount:</span>
                            <span className="text-[var(--accent-green)] font-semibold">{tx.Amount}</span>
                          </div>
                        </div>
                      </motion.div>
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