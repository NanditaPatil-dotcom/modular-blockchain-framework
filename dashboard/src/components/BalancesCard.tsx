import { useState } from 'react'

interface BalanceResponse {
  address: string
  balance: number
}

export default function BalancesCard({ rpcUrl }: { rpcUrl: string }) {
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState<BalanceResponse | null>(null)
  const [lastSync, setLastSync] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const getBalance = async () => {
    if (!address.trim()) return

    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${rpcUrl}/balance?addr=${encodeURIComponent(address)}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data: BalanceResponse = await response.json()
      setBalance(data)
      setLastSync(new Date().toLocaleString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setBalance(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Balances</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter address"
          />
        </div>
        <button
          onClick={getBalance}
          disabled={loading || !address.trim()}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Get Balance'}
        </button>
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        {balance && (
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-600">Address: {balance.address}</div>
            <div className="text-lg font-semibold">Balance: {balance.balance}</div>
            <div className="text-xs text-gray-500">Last sync: {lastSync}</div>
          </div>
        )}
      </div>
    </div>
  )
}