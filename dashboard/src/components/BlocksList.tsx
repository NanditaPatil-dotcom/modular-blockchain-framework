import { useState, useEffect, useCallback } from 'react'

interface Transaction {
  id: string
  from: string
  to: string
  amount: number
  nonce: number
  signature: string
}

interface Block {
  number: number
  prevHash: string
  timestamp: number
  transactions: Transaction[]
  nonce: number
  hash: string
}

export default function BlocksList({ rpcUrl }: { rpcUrl: string }) {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const fetchBlocks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${rpcUrl}/blocks`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data: Block[] = await response.json()
      setBlocks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blocks')
    } finally {
      setLoading(false)
    }
  }, [rpcUrl])

  useEffect(() => {
    fetchBlocks()
    const interval = setInterval(fetchBlocks, 3000) // More frequent updates
    return () => clearInterval(interval)
  }, [rpcUrl, fetchBlocks])

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Block Explorer</h2>
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <h3 className="font-medium text-gray-700">Recent Blocks</h3>
          {blocks.map((block) => (
            <div
              key={block.number}
              onClick={() => setSelectedBlock(block)}
              className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                selectedBlock?.number === block.number ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">Block #{block.number}</span>
                <span className="text-sm text-gray-600">{block.transactions.length} tx</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(block.timestamp * 1000).toLocaleString()}
              </div>
              <div className="text-xs font-mono text-gray-500 mt-1">
                Hash: {block.hash.slice(0, 16)}...
              </div>
            </div>
          ))}
          {blocks.length === 0 && !loading && !error && (
            <div className="text-gray-500 text-center py-4">No blocks found</div>
          )}
        </div>

        {selectedBlock && (
          <div className="space-y-2">
            <h3 className="font-medium text-gray-700">Block Details</h3>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <div><strong>Number:</strong> {selectedBlock.number}</div>
              <div><strong>Timestamp:</strong> {new Date(selectedBlock.timestamp * 1000).toLocaleString()}</div>
              <div><strong>Prev Hash:</strong> {selectedBlock.prevHash.slice(0, 20)}...</div>
              <div><strong>Hash:</strong> {selectedBlock.hash.slice(0, 20)}...</div>
              <div><strong>Nonce:</strong> {selectedBlock.nonce}</div>
              <div><strong>Transactions:</strong> {selectedBlock.transactions.length}</div>
            </div>

            <h4 className="font-medium text-gray-700 text-sm">Transactions</h4>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {selectedBlock.transactions.map((tx, idx) => (
                <div key={idx} className="bg-white border p-2 rounded text-xs">
                  <div className="font-mono text-gray-600">ID: {tx.id.slice(0, 16)}...</div>
                  <div>From: {tx.from.slice(0, 16)}...</div>
                  <div>To: {tx.to.slice(0, 16)}...</div>
                  <div>Amount: {tx.amount}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}