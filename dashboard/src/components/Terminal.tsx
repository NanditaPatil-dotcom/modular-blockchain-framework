import { useState, useRef, useEffect } from 'react'
import { getBalance, submitTransaction } from '../lib/rpc'
import { signTransaction } from '../utils/crypto'

interface CommandResult {
  command: string
  output: string
  error?: boolean
}

export default function Terminal() {
  const [history, setHistory] = useState<CommandResult[]>([])
  const [currentCommand, setCurrentCommand] = useState('')
  const [loading, setLoading] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const addToHistory = (result: CommandResult) => {
    setHistory(prev => [...prev, result])
  }

  const executeCommand = async (command: string) => {
    const trimmed = command.trim()
    if (!trimmed) return

    setLoading(true)
    try {
      const result = await parseAndExecuteCommand(trimmed)
      addToHistory({ command: trimmed, output: result })
    } catch (error) {
      addToHistory({
        command: trimmed,
        output: error instanceof Error ? error.message : 'Unknown error',
        error: true
      })
    } finally {
      setLoading(false)
    }
  }

  const parseAndExecuteCommand = async (command: string): Promise<string> => {
    const parts = command.split(/\s+/)
    const cmd = parts[0].toLowerCase()

    switch (cmd) {
      case 'send': {
        const args = parseSendArgs(parts.slice(1))
        return await executeSend(args)
      }
      case 'balance': {
        if (parts.length < 2) throw new Error('Usage: balance <address>')
        return await executeBalance(parts[1])
      }
      case 'help':
        return getHelpText()
      case 'clear':
        setHistory([])
        return 'Terminal cleared'
      default:
        throw new Error(`Unknown command: ${cmd}. Type 'help' for available commands.`)
    }
  }

  const parseSendArgs = (args: string[]) => {
    let to = '', amount = 0, from = '', privateKey = ''

    for (let i = 0; i < args.length; i++) {
      switch (args[i]) {
        case '--to':
          to = args[++i] || ''
          break
        case '--amount':
          amount = parseFloat(args[++i] || '0')
          break
        case '--from':
          from = args[++i] || ''
          break
        case '--key':
          privateKey = args[++i] || ''
          break
      }
    }

    return { to, amount, from, privateKey }
  }

  const executeSend = async (args: { to: string; amount: number; from: string; privateKey: string }) => {
    let { to, amount, from, privateKey } = args

    if (!to || !amount) {
      throw new Error('Usage: send --to <address> --amount <number> [--from <address> --key <privateKey>]')
    }

    // Get wallet from localStorage if not provided
    if (!from || !privateKey) {
      const stored = localStorage.getItem('wallet')
      if (!stored) throw new Error('No wallet found. Create one first or provide --from and --key')
      const walletData = JSON.parse(stored)
      from = from || walletData.address
      privateKey = privateKey || walletData.privateKey
    }

    // Get nonce from node (prevent replay attacks)
    // In a real implementation, you'd call an RPC endpoint to get the next nonce
    // For now, we'll use a simple incrementing nonce
    const nonce = Date.now()

    const txPayload = { from, to, amount, nonce }
    const signature = await signTransaction(txPayload, privateKey)

    const result = await submitTransaction({ ...txPayload, signature })
    return `Transaction submitted successfully: ${JSON.stringify(result)}`
  }

  const executeBalance = async (address: string): Promise<string> => {
    const result = await getBalance(address)
    return `Balance for ${address}: ${result.balance}`
  }

  const getHelpText = () => {
    return `
Available commands:
  send --to <address> --amount <number> [--from <address> --key <privateKey>]
    Send tokens to an address. Uses saved wallet if --from/--key not provided.

  balance <address>
    Check balance of an address.

  help
    Show this help message.

  clear
    Clear terminal history.

Examples:
  send --to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e --amount 10
  balance 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
    `.trim()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentCommand.trim() && !loading) {
      executeCommand(currentCommand)
      setCurrentCommand('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      // Could implement command history here
      e.preventDefault()
    }
  }

  return (
    <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
      <div className="mb-2 text-green-300">Blockchain Terminal v0.1</div>

      <div
        ref={terminalRef}
        className="h-64 overflow-y-auto mb-2 bg-gray-900 p-2 rounded"
      >
        {history.map((item, index) => (
          <div key={index} className="mb-1">
            <div className="text-blue-400">$ {item.command}</div>
            <div className={item.error ? 'text-red-400' : 'text-green-400'}>
              {item.output}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-yellow-400">Executing...</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <span className="text-green-400">$</span>
        <input
          ref={inputRef}
          type="text"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-green-400"
          placeholder="Type 'help' for commands..."
          disabled={loading}
          autoFocus
        />
      </form>
    </div>
  )
}