import { useState, useEffect, useCallback } from 'react'

interface Transaction {
  id: string
  from: string
  to: string
  amount: number
  nonce: number
  signature: string
}

export default function MempoolMonitor({ rpcUrl }: { rpcUrl: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const fetchMempool = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${rpcUrl}/mempool`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data: Transaction[] = await response.json()
      setTransactions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mempool')
    } finally {
      setLoading(false)
    }
  }, [rpcUrl])

  useEffect(() => {
    fetchMempool()
    const interval = setInterval(fetchMempool, 2000) // Poll every 2 seconds
    return () => clearInterval(interval)
  }, [rpcUrl, fetchMempool])

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Mempool Monitor</h2>
      <div className="mb-4">
        <button
          onClick={fetchMempool}
          disabled={loading}
          className="bg-orange-500 text-white py-1 px-3 rounded-md hover:bg-orange-600 disabled:bg-gray-300 text-sm"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
        <span className="ml-2 text-sm text-gray-600">
          {transactions.length} pending transactions
        </span>
      </div>
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {transactions.map((tx) => (
          <div key={tx.id} className="border border-gray-200 p-3 rounded">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-sm font-mono text-gray-600">ID: {tx.id.slice(0, 16)}...</div>
                <div className="text-sm">From: {tx.from.slice(0, 20)}...</div>
                <div className="text-sm">To: {tx.to.slice(0, 20)}...</div>
                <div className="text-sm">Amount: {tx.amount}</div>
                <div className="text-sm">Nonce: {tx.nonce}</div>
              </div>
              <div className="text-xs text-gray-500">
                Pending
              </div>
            </div>
          </div>
        ))}
        {transactions.length === 0 && !loading && !error && (
          <div className="text-gray-500 text-center py-4">No pending transactions</div>
        )}
      </div>
    </div>
  )
}