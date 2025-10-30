import { ethers } from 'ethers'

export async function signTransaction(txPayload: { from: string; to: string; amount: number; nonce: number }, privateKey: string): Promise<string> {
  try {
    // Ensure private key starts with 0x
    let cleanPrivateKey = privateKey.trim()
    if (!cleanPrivateKey.startsWith('0x')) {
      cleanPrivateKey = '0x' + cleanPrivateKey
    }

    const wallet = new ethers.Wallet(cleanPrivateKey)
    const message = JSON.stringify(txPayload)
    const messageHash = ethers.keccak256(ethers.toUtf8Bytes(message))
    const rawSignature = wallet.signingKey.sign(messageHash)
    const signatureStruct = ethers.Signature.from(rawSignature)
    const recovery = signatureStruct.v >= 27 ? signatureStruct.v - 27 : signatureStruct.v
    const signatureBytes = ethers.concat([
      ethers.getBytes(signatureStruct.r),
      ethers.getBytes(signatureStruct.s),
      new Uint8Array([recovery])
    ])
    return ethers.hexlify(signatureBytes)
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