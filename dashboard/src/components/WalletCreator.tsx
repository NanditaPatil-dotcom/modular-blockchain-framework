import { useState } from 'react'
import { ethers } from 'ethers'

interface Wallet {
  address: string
  privateKey: string
}

export default function WalletCreator() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(false)

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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create Wallet</h2>
      <div className="space-y-4">
        <button
          onClick={generateWallet}
          disabled={loading}
          className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Generate New Wallet'}
        </button>

        {wallet && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={wallet.address}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(wallet.address)}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Private Key
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={wallet.privateKey}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(wallet.privateKey)}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-red-600 mt-1">
                ⚠️ Keep your private key secure and never share it!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}