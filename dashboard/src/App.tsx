import { useState } from 'react'
import BalancesCard from './components/BalancesCard'
import SendTransactionForm from './components/SendTransactionForm'
import BlocksList from './components/BlocksList'

function App() {
  const [rpcUrl, setRpcUrl] = useState(import.meta.env.VITE_RPC_BASE_URL || 'http://localhost:8080')

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Modular Blockchain</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="rpc-url" className="text-sm font-medium text-gray-700">RPC Base URL:</label>
          <input
            id="rpc-url"
            type="text"
            value={rpcUrl}
            onChange={(e) => setRpcUrl(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BalancesCard rpcUrl={rpcUrl} />
        <SendTransactionForm rpcUrl={rpcUrl} />
        <BlocksList rpcUrl={rpcUrl} />
      </div>
    </div>
  )
}

export default App
