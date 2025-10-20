// RPC helper functions for communicating with the blockchain node

const DEFAULT_RPC_URL = import.meta.env.VITE_RPC_BASE_URL || 'http://localhost:8080'

export async function callRPC(endpoint: string, options?: RequestInit, rpcUrl?: string) {
  const url = `${rpcUrl || DEFAULT_RPC_URL}${endpoint}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`RPC call failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function getBalance(address: string, rpcUrl?: string) {
  return callRPC(`/balance?addr=${encodeURIComponent(address)}`, undefined, rpcUrl)
}

export async function submitTransaction(tx: any, rpcUrl?: string) {
  return callRPC('/submitTx', {
    method: 'POST',
    body: JSON.stringify(tx),
  }, rpcUrl)
}

export async function getBlocks(rpcUrl?: string) {
  return callRPC('/blocks', undefined, rpcUrl)
}

export async function getMempool(rpcUrl?: string) {
  return callRPC('/mempool', undefined, rpcUrl)
}

export async function getHealth(rpcUrl?: string) {
  return callRPC('/health', undefined, rpcUrl)
}