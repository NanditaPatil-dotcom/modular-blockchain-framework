import { useState, useEffect } from 'react'
import BalancesCard from './components/BalancesCard'
import SendTransactionForm from './components/SendTransactionForm'
import BlocksList from './components/BlocksList'
import WalletCreator from './components/WalletCreator'
import MempoolMonitor from './components/MempoolMonitor'
import Terminal from './components/Terminal'
import { getBlocks, getMempool } from './lib/rpc'

function App() {
  const [rpcUrl, setRpcUrl] = useState(import.meta.env.VITE_RPC_BASE_URL || 'http://localhost:8080')
  const [networkStats, setNetworkStats] = useState({
    nodes: 1,
    blocks: 0,
    pendingTxs: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [blocksRes, mempoolRes] = await Promise.all([
          getBlocks(rpcUrl),
          getMempool(rpcUrl)
        ])
        setNetworkStats({
          nodes: 1, // Simplified - would need network discovery
          blocks: blocksRes.length,
          pendingTxs: mempoolRes.length
        })
      } catch (error) {
        console.error('Failed to fetch network stats:', error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [rpcUrl])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-blue-400">Modular Blockchain</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-400">● Nodes: {networkStats.nodes}</span>
              <span className="text-blue-400">● Blocks: {networkStats.blocks}</span>
              <span className="text-yellow-400">● Pending TXs: {networkStats.pendingTxs}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="rpc-url" className="text-sm font-medium text-gray-300">RPC URL:</label>
            <input
              id="rpc-url"
              type="text"
              value={rpcUrl}
              onChange={(e) => setRpcUrl(e.target.value)}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <WalletCreator />
          <BalancesCard rpcUrl={rpcUrl} />
          <SendTransactionForm rpcUrl={rpcUrl} />
          <MempoolMonitor rpcUrl={rpcUrl} />
          <BlocksList rpcUrl={rpcUrl} />
          <Terminal />
        </div>
      </main>
    </div>
  )
}

export default App
