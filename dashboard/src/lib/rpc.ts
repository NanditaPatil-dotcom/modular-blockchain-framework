// RPC helper functions for communicating with the blockchain node

const RPC_BASE = import.meta.env.VITE_RPC_BASE_URL || 'http://localhost:8080';

export async function getBalance(address: string) {
  if (!address) return 0;
  const url = `${RPC_BASE}/balance?addr=${encodeURIComponent(address)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('failed to fetch balance');
  const data = await res.json();
  // expecting { address, balance }
  return data.balance ?? 0;
}

export async function requestFaucet(address: string) {
  const url = `${RPC_BASE}/faucet`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || 'faucet request failed');
  }
  const data = await res.json();
  return data; // { status, address, amount, balance }
}

export async function callRPC(endpoint: string, options?: RequestInit, rpcUrl?: string) {
  const url = `${rpcUrl || RPC_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limited. Please wait before retrying.');
    }
    throw new Error(`RPC call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function submitTransaction(tx: { from: string; to: string; amount: number; nonce: number; signature: string }, rpcUrl?: string) {
  return callRPC('/submitTx', {
    method: 'POST',
    body: JSON.stringify(tx),
  }, rpcUrl);
}

export async function getBlocks(rpcUrl?: string) {
  return callRPC('/blocks', undefined, rpcUrl);
}

export async function getMempool(rpcUrl?: string) {
  return callRPC('/mempool', undefined, rpcUrl);
}

export async function getMempoolCount(rpcUrl?: string) {
  const mempool = await getMempool(rpcUrl);
  return mempool.length;
}

export async function addBalance(userId: string, amount: number, rpcUrl?: string) {
  return callRPC('/addBalance', {
    method: 'POST',
    body: JSON.stringify({ userId, amount }),
  }, rpcUrl);
}

export async function getHealth(rpcUrl?: string) {
  return callRPC('/health', undefined, rpcUrl);
}