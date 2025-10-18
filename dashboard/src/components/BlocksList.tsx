import { useState, useEffect } from 'react'

interface Block {
  number: number
  txCount: number
}

export default function BlocksList({ rpcUrl }: { rpcUrl: string }) {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const fetchBlocks = async () => {
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
  }

  useEffect(() => {
    fetchBlocks()
    const interval = setInterval(fetchBlocks, 5000)
    return () => clearInterval(interval)
  }, [rpcUrl])

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Blocks</h2>
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {blocks.map((block) => (
          <div key={block.number} className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="font-medium">Block #{block.number}</span>
            <span className="text-sm text-gray-600">{block.txCount} tx</span>
          </div>
        ))}
        {blocks.length === 0 && !loading && !error && (
          <div className="text-gray-500 text-center py-4">No blocks found</div>
        )}
      </div>
    </div>
  )
}