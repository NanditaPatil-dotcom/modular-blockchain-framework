import { useState } from 'react'

interface TransactionData {
  from: string
  to: string
  amount: string
  nonce: string
  signature: string
}

export default function SendTransactionForm({ rpcUrl }: { rpcUrl: string }) {
  const [formData, setFormData] = useState<TransactionData>({
    from: '',
    to: '',
    amount: '',
    nonce: '',
    signature: ''
  })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const submitTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setToast(null)

    try {
      const response = await fetch(`${rpcUrl}/submitTx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: formData.from,
          to: formData.to,
          amount: parseFloat(formData.amount),
          nonce: parseInt(formData.nonce),
          signature: formData.signature
        })
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      setToast({ message: 'Transaction submitted successfully!', type: 'success' })
      setFormData({
        from: '',
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

  const isFormValid = Object.values(formData).every(value => value.trim() !== '')

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Send Transaction</h2>
      <form onSubmit={submitTransaction} className="space-y-4">
        <div>
          <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">
            From
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
        <div>
          <label htmlFor="signature" className="block text-sm font-medium text-gray-700 mb-1">
            Signature
          </label>
          <input
            id="signature"
            name="signature"
            type="text"
            value={formData.signature}
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