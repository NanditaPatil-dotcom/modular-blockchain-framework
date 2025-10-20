import { ethers } from 'ethers'

export async function signTransaction(txPayload: { from: string; to: string; amount: number; nonce: number }, privateKey: string): Promise<string> {
  const wallet = new ethers.Wallet(privateKey)
  // Canonical payload: JSON.stringify the transaction object
  const payload = JSON.stringify(txPayload)
  const signature = await wallet.signMessage(payload)
  return signature
}

export async function submitTransaction(rpcBaseUrl: string, txPayload: { from: string; to: string; amount: number; nonce: number }, signature: string) {
  const body = { ...txPayload, signature }
  const response = await fetch(`${rpcBaseUrl}/submitTx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return response.json()
}