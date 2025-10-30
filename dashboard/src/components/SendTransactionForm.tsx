import { useState } from 'react'
import { signTransaction } from '../utils/crypto'

interface TransactionData {
  from: string
  to: string
  amount: string
  nonce: string
  signature: string
}

interface Wallet {
  address?: string
  privateKey: string
  publicKey?: string
}

export default function SendTransactionForm({ rpcUrl }: { rpcUrl: string }) {
  const [formData, setFormData] = useState<TransactionData>({
    from: '',
    to: '',
    amount: '',
    nonce: '',
    signature: ''
  })
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [privateKey, setPrivateKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const fetchWalletBalance = async (address: string) => {
    if (!address) {
      setBalance(null)
      return
    }

    setBalanceLoading(true)
    try {
      const response = await fetch(`${rpcUrl}/balance?addr=${encodeURIComponent(address)}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()
      setBalance(typeof data.balance === 'number' ? data.balance : null)
    } catch {
      setBalance(null)
    } finally {
      setBalanceLoading(false)
    }
  }

  const loadWallet = async () => {
    const stored = localStorage.getItem('wallet')
    if (stored) {
      const parsedWallet: Wallet = JSON.parse(stored)
      setWallet(parsedWallet)
      setFormData(prev => ({ ...prev, from: parsedWallet.publicKey || parsedWallet.address || '' }))
      const address = parsedWallet.address || parsedWallet.publicKey || ''
      await fetchWalletBalance(address)
    }
  }

  const signAndSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!wallet && !privateKey) {
      setToast({ message: 'Please load a wallet or enter private key', type: 'error' })
      return
    }

    setLoading(true)
    setToast(null)

    try {
      const from = wallet ? wallet.address || wallet.publicKey || '' : formData.from
      const privKey = wallet ? wallet.privateKey : privateKey
      const amount = parseInt(formData.amount)
      const nonce = parseInt(formData.nonce)

      // Client-side signing only - private key never sent to server
      const txPayload = { from, to: formData.to, amount, nonce }
      const signature = await signTransaction(txPayload, privKey)

      const response = await fetch(`${rpcUrl}/submitTx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from,
          to: formData.to,
          amount,
          nonce,
          signature
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `HTTP ${response.status}`)
      }

      setToast({ message: 'Transaction submitted successfully!', type: 'success' })
      if (wallet && from) {
        await fetchWalletBalance(from)
      }
      setFormData({
        from: wallet ? (wallet.address || wallet.publicKey || '') : '',
        to: '',
        amount: '',
        nonce: '',
        signature: ''
      })
    } catch (err) {
      console.error('Transaction error:', err)
      setToast({
        message: err instanceof Error ? err.message : 'Failed to submit transaction',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = (formData.to.trim() && formData.amount.trim() && formData.nonce.trim()) &&
    (wallet || (formData.from.trim() && privateKey.trim()))

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Send Transaction</h2>
        {wallet && (
          <div className="text-sm text-gray-300">
            {balanceLoading ? 'Loading balance...' : `Balance: ${balance ?? '—'}`}
          </div>
        )}
      </div>
      <div className="mb-4">
        <button
          type="button"
          onClick={loadWallet}
          className="bg-teal-700 text-white py-1 px-3 rounded-md hover:bg-teal-600 text-sm"
        >
          Load Saved Wallet
        </button>
        {wallet && <span className="ml-2 text-sm text-green-600">Wallet loaded</span>}
      </div>
      <form onSubmit={signAndSubmitTransaction} className="space-y-4">
        {!wallet && (
          <>
            <div>
              <label htmlFor="from" className="block text-sm font-medium text-white-700 mb-1">
                From (Address)
              </label>
              <input
                id="from"
                name="from"
                type="text"
                value={formData.from}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="privateKey" className="block text-sm font-medium text-white-700 mb-1">
                Private Key
              </label>
              <input
                id="privateKey"
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </>
        )}
        {wallet && (
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-600">From: {wallet.address || wallet.publicKey || '—'}</div>
          </div>
        )}
        <div>
          <label htmlFor="to" className="block text-sm font-medium text-white-700 mb-1">
            To (Recipient Address)
          </label>
          <input
            id="to"
            name="to"
            type="text"
            value={formData.to}
            onChange={handleChange}
            placeholder="Enter recipient's public wallet address"
            className="w-full px-3 py-2 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-white-700 mb-1">
            Amount
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="nonce" className="block text-sm font-medium text-white-700 mb-1">
            Nonce
          </label>
          <input
            id="nonce"
            name="nonce"
            type="number"
            value={formData.nonce}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-600 disabled:bg-teal-600 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Transaction'}
        </button>
      </form>
      {toast && (
        <div className={`mt-4 p-3 rounded-md ${toast.type === 'success' ? 'bg-teal-600 text-white-800' : 'bg-red-100 text-red-800'}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}