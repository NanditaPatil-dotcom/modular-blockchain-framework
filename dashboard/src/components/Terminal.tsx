import { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';
import { getBalance, submitTransaction, addBalance } from '../lib/rpc';
import { signTransaction } from '../utils/crypto';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandResult {
  command: string;
  output: string;
  error?: boolean;
  timestamp: number;
}

export default function Terminal() {
  const [history, setHistory] = useState<CommandResult[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [caretVisible, setCaretVisible] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCaretVisible(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const addToHistory = (result: CommandResult) => {
    setHistory(prev => [...prev, result]);
  };

  const executeCommand = async (command: string) => {
    const trimmed = command.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const result = await parseAndExecuteCommand(trimmed);
      addToHistory({ command: trimmed, output: result, timestamp: Date.now() });
    } catch (error) {
      addToHistory({
        command: trimmed,
        output: error instanceof Error ? error.message : 'Unknown error',
        error: true,
        timestamp: Date.now()
      });
    } finally {
      setLoading(false);
    }
  };

  const parseAndExecuteCommand = async (command: string): Promise<string> => {
    const parts = command.split(/\s+/);
    const cmd = parts[0].toLowerCase();

    switch (cmd) {
      case 'send': {
        const args = parseSendArgs(parts.slice(1));
        return await executeSend(args);
      }
      case 'balance': {
        if (parts.length < 2) throw new Error('Usage: balance <address>');
        return await executeBalance(parts[1]);
      }
      case 'addbalance': {
        if (parts.length < 2) throw new Error('Usage: addBalance <amount>');
        const amount = parseInt(parts[1]);
        if (isNaN(amount) || amount <= 0) throw new Error('Invalid amount. Must be a positive number.');
        return await executeAddBalance(amount);
      }
      case 'help':
        return getHelpText();
      case 'clear':
        setHistory([]);
        return 'Terminal cleared';
      default:
        throw new Error(`Unknown command: ${cmd}. Type 'help' for available commands.`);
    }
  };

  const parseSendArgs = (args: string[]) => {
    let to = '', amount = 0, from = '', privateKey = '';

    for (let i = 0; i < args.length; i++) {
      switch (args[i]) {
        case '--to':
          to = args[++i] || '';
          break;
        case '--amount':
          amount = parseFloat(args[++i] || '0');
          break;
        case '--from':
          from = args[++i] || '';
          break;
        case '--key':
          privateKey = args[++i] || '';
          break;
      }
    }

    return { to, amount, from, privateKey };
  };

  const executeSend = async (args: { to: string; amount: number; from: string; privateKey: string }) => {
    const { to, amount } = args;
    let { from, privateKey } = args;

    if (!to || !amount) {
      throw new Error('Usage: send --to <address> --amount <number> [--from <address> --key <privateKey>]');
    }

    // Get wallet from localStorage if not provided
    if (!from || !privateKey) {
      const stored = localStorage.getItem('wallet');
      if (!stored) throw new Error('No wallet found. Create one first or provide --from and --key');
      const walletData = JSON.parse(stored);
      from = from || walletData.address;
      privateKey = privateKey || walletData.privateKey;
    }

    const nonce = Date.now();
    const txPayload = { from, to, amount, nonce };
    const signature = await signTransaction(txPayload, privateKey);

    await submitTransaction({ ...txPayload, signature });
    return `✅ Transaction created
🔍 Broadcasting to network...
✅ Transaction verified
⛓️  Added to mempool
📦 TX Hash: ${signature.slice(0, 16)}...`;
  };

  const executeBalance = async (address: string): Promise<string> => {
    const result = await getBalance(address);
    return `Balance for ${address}: ${result.balance}`;
  };

  const executeAddBalance = async (amount: number): Promise<string> => {
    const stored = localStorage.getItem('wallet');
    if (!stored) throw new Error('No wallet found. Create one first.');
    const walletData = JSON.parse(stored);
    const result = await addBalance(walletData.address, amount);
    return `✅ Added ${amount} testcoins. New balance: ${result.newBalance}`;
  };

  const getHelpText = () => {
    return `
Available commands:
  send --to <address> --amount <number> [--from <address> --key <privateKey>]
    Send tokens to an address. Uses saved wallet if --from/--key not provided.

  balance <address>
    Check balance of an address.

  addBalance <amount>
    Add testcoins to your wallet balance.

  help
    Show this help message.

  clear
    Clear terminal history.

Examples:
  send --to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e --amount 10
  balance 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
  addBalance 50
    `.trim();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand.trim() && !loading) {
      executeCommand(currentCommand);
      setCurrentCommand('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <TerminalIcon className="w-5 h-5 text-[var(--accent-teal)]" />
        <h3 className="text-lg font-semibold">Terminal</h3>
      </div>

      <div
        ref={terminalRef}
        className="h-80 overflow-y-auto mb-4 bg-[var(--bg-secondary)] p-4 rounded-xl terminal-font text-sm border border-[var(--border)]"
      >
        <AnimatePresence>
          {history.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="mb-3"
            >
              <div className="text-[var(--accent-teal)] flex items-center gap-2 mb-1">
                <span>❯</span>
                <span className="opacity-80">{item.command}</span>
                <span className="text-xs text-[var(--text-secondary)] ml-auto">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className={`ml-4 whitespace-pre-line ${item.error ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
                {item.output}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[var(--accent-pink)] ml-4 animate-pulse"
          >
            ⏳ Processing transaction...
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <span className="text-[var(--accent-teal)] terminal-font">❯</span>
        <input
          ref={inputRef}
          type="text"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] placeholder-[var(--text-secondary)] terminal-font focus:ring-0"
          placeholder="send --to 0x... --amount 10"
          disabled={loading}
          autoFocus
          aria-label="Terminal command input"
        />
        <span className={`terminal-font text-[var(--accent-teal)] ${caretVisible ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
          █
        </span>
      </form>

      <div className="mt-3 text-xs text-[var(--text-secondary)]">
        Type 'help' for available commands
      </div>
    </motion.div>
  );
}