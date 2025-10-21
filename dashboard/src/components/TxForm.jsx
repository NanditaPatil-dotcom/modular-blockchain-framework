import { useState, useEffect } from 'react';
import { Send, Hash, User, DollarSign } from 'lucide-react';
import { submitTransaction, getBalance } from '../lib/rpc';
import { signTransaction } from '../utils/crypto';
import { motion } from 'framer-motion';

export default function TxForm({ rpcUrl, onTransactionSent }) {
  const [formData, setFormData] = useState({
    to: '',
    amount: '',
    nonce: ''
  });
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('wallet');
    if (stored) {
      setWallet(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (wallet?.address) {
      fetchBalance();
    }
  }, [wallet?.address, rpcUrl]);

  const fetchBalance = async () => {
    if (!wallet?.address) return;
    try {
      const result = await getBalance(wallet.address, rpcUrl);
      setBalance(result.balance || 0);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!wallet) {
      alert('No wallet found. Please create a wallet first.');
      return;
    }

    if (!formData.to || !formData.amount) {
      alert('Please fill in all required fields.');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0 || amount > balance) {
      alert('Invalid amount. Must be greater than 0 and not exceed your balance.');
      return;
    }

    setLoading(true);
    try {
      const nonce = formData.nonce ? parseInt(formData.nonce) : Date.now();
      const txPayload = {
        from: wallet.address,
        to: formData.to,
        amount,
        nonce
      };

      const signature = await signTransaction(txPayload, wallet.privateKey);
      await submitTransaction({ ...txPayload, signature }, rpcUrl);

      // Reset form
      setFormData({ to: '', amount: '', nonce: '' });

      // Notify parent component
      if (onTransactionSent) {
        onTransactionSent();
      }

      // Refresh balance
      await fetchBalance();

      alert('Transaction submitted successfully!');
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!wallet) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 text-center"
      >
        <Send className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Send Transaction</h3>
        <p className="text-[var(--text-secondary)]">
          Create a wallet first to send transactions
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Send className="w-5 h-5 text-[var(--accent-teal)]" />
        <h3 className="text-lg font-semibold">Send Transaction</h3>
      </div>

      <div className="mb-4 p-3 bg-[var(--bg-secondary)] rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-secondary)]">Your Balance:</span>
          <span className="font-semibold text-[var(--accent-teal)]">{balance.toFixed(2)} tokens</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <User className="w-4 h-4" />
            To Address
          </label>
          <input
            type="text"
            value={formData.to}
            onChange={(e) => handleChange('to', e.target.value)}
            className="input-field w-full"
            placeholder="0x..."
            required
            aria-label="Recipient address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max={balance}
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            className="input-field w-full"
            placeholder="0.00"
            required
            aria-label="Transaction amount"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Nonce (Optional)
          </label>
          <input
            type="number"
            value={formData.nonce}
            onChange={(e) => handleChange('nonce', e.target.value)}
            className="input-field w-full"
            placeholder="Auto-generated"
            aria-label="Transaction nonce"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !formData.to || !formData.amount}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send transaction"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Sending...
            </div>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Transaction
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-xs text-[var(--text-secondary)]">
        <p>From: {wallet.address.slice(0, 20)}...</p>
        <p>Transactions are signed locally using ethers.js</p>
      </div>
    </motion.div>
  );
}