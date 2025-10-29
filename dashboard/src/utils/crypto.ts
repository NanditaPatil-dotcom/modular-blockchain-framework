import { ethers } from 'ethers'

export async function signTransaction(txPayload: { from: string; to: string; amount: number; nonce: number }, privateKey: string): Promise<string> {
  try {
    // Ensure private key starts with 0x
    let cleanPrivateKey = privateKey.trim()
    if (!cleanPrivateKey.startsWith('0x')) {
      cleanPrivateKey = '0x' + cleanPrivateKey
    }

    const wallet = new ethers.Wallet(cleanPrivateKey)
    // Create canonical message that matches backend format: {"from":"...","to":"...","amount":123,"nonce":456}
    const message = JSON.stringify(txPayload)
    
    // Hash the message with Keccak256 (same as backend)
    const messageHash = ethers.keccak256(ethers.toUtf8Bytes(message))
    
    // Sign the hash directly (not the message, to avoid Ethereum message prefix)
    const signature = wallet.signingKey.sign(messageHash).serialized
    return signature
  } catch (error) {
    console.error('Error signing transaction:', error)
    throw new Error('Invalid private key format. Please ensure it\'s a valid 64-character hexadecimal string.')
  }
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