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
  address: string
  privateKey: string
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const loadWallet = () => {
    const stored = localStorage.getItem('wallet')
    if (stored) {
      const parsedWallet = JSON.parse(stored)
      setWallet(parsedWallet)
      setFormData(prev => ({ ...prev, from: parsedWallet.publicKey }))
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
      const from = wallet ? wallet.address : formData.from
      const privKey = wallet ? wallet.privateKey : privateKey
      const amount = parseFloat(formData.amount)
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
      setFormData({
        from: wallet ? wallet.address : '',
        to: '',
        amount: '',
        nonce: '',
        signature: ''
      })
    } catch (err) {
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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Send Transaction</h2>
      <div className="mb-4">
        <button
          type="button"
          onClick={loadWallet}
          className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 text-sm"
        >
          Load Saved Wallet
        </button>
        {wallet && <span className="ml-2 text-sm text-green-600">Wallet loaded</span>}
      </div>
      <form onSubmit={signAndSubmitTransaction} className="space-y-4">
        {!wallet && (
          <>
            <div>
              <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">
                From (Address)
              </label>
              <input
                id="from"
                name="from"
                type="text"
                value={formData.from}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="privateKey" className="block text-sm font-medium text-gray-700 mb-1">
                Private Key
              </label>
              <input
                id="privateKey"
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </>
        )}
        {wallet && (
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-600">From: {wallet.address}</div>
          </div>
        )}
        <div>
          <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
            To
          </label>
          <input
            id="to"
            name="to"
            type="text"
            value={formData.to}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="nonce" className="block text-sm font-medium text-gray-700 mb-1">
            Nonce
          </label>
          <input
            id="nonce"
            name="nonce"
            type="number"
            value={formData.nonce}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Transaction'}
        </button>
      </form>
      {toast && (
        <div className={`mt-4 p-3 rounded-md ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}