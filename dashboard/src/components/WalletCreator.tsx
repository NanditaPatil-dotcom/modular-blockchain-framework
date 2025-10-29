import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

interface Wallet {
  address: string
  privateKey: string
}

export default function WalletCreator({ rpcUrl }: { rpcUrl: string }) {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load existing wallet on component mount
    const stored = localStorage.getItem('wallet')
    if (stored) {
      try {
        const walletData = JSON.parse(stored)
        setWallet(walletData)
      } catch (error) {
        console.error('Failed to load wallet:', error)
      }
    }
  }, [])

  const generateWallet = async () => {
    setLoading(true)
    try {
      const ethersWallet = ethers.Wallet.createRandom()
      const walletData = {
        address: ethersWallet.address,
        privateKey: ethersWallet.privateKey
      }

      // Save to localStorage
      localStorage.setItem('wallet', JSON.stringify(walletData))
      setWallet(walletData)

      // Call faucet to add initial balance
      await fetch(`${rpcUrl}/api/faucet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address: walletData.address })
      })
    } catch (error) {
      console.error('Failed to generate wallet:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-white">Create Wallet</h2>
      <div className="space-y-4">
        <button
          onClick={generateWallet}
          disabled={loading}
          className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Generate New Wallet'}
        </button>

        {wallet && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-white-700 mb-1">
                Address
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={wallet.address}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-700 rounded-md text-white"
                />
                <button
                  onClick={() => copyToClipboard(wallet.address)}
                  className="px-3 py-2 bg-teal-700 text-white-700 rounded-md hover:bg-teal-700"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white-700 mb-1">
                Private Key
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={wallet.privateKey}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-700 rounded-md text-white"
                />
                <button
                  onClick={() => copyToClipboard(wallet.privateKey)}
                  className="px-3 py-2 bg-teal-700 text-white-700 rounded-md hover:bg-teal-700"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}