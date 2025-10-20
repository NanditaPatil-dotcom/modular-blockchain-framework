package core

import (
	"sync"
)

type Chain struct {
	mu      sync.RWMutex
	Blocks  []Block
	State   map[string]int // simple state: balances
	Nonces  map[string]uint64 // per-account nonces to prevent replay
}

func NewChain() *Chain {
	c := &Chain{
		State:  make(map[string]int),
		Nonces: make(map[string]uint64),
	}
	// genesis
	c.Blocks = append(c.Blocks, Block{Number: 0, PrevHash: "", Timestamp: 0})

	// Initialize genesis balances (demo/testnet coins)
	c.State["0x742d35Cc6634C0532925a3b844Bc454e4438f44e"] = 1000 // demo address 1
	c.State["0x742d35Cc6634C0532925a3b844Bc454e4438f44f"] = 1000 // demo address 2
	c.State["nandita"] = 100  // legacy for compatibility
	c.State["aanya"] = 0      // legacy for compatibility

	return c
}

func (c *Chain) AddBlock(b Block) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.Blocks = append(c.Blocks, b)
	// apply txs to state (naive)
	for _, tx := range b.Transactions {
		c.State[tx.From] -= tx.Amount
		c.State[tx.To] += tx.Amount
	}
}

func (c *Chain) GetBalance(addr string) int {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.State[addr]
}

func (c *Chain) GetNonce(addr string) uint64 {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.Nonces[addr]
}

func (c *Chain) SetNonce(addr string, nonce uint64) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.Nonces[addr] = nonce
}