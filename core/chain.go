package core

import (
	"sync"
)

type Chain struct {
	mu     sync.RWMutex
	Blocks []Block
	State  map[string]int    // simple state: balances
	Nonces map[string]uint64 // per-account nonces to prevent replay
}

func NewChain() *Chain {
	c := &Chain{
		State:  make(map[string]int),
		Nonces: make(map[string]uint64),
	}
	c.CreateGenesisIfNotExists()
	return c
}

func (c *Chain) AddBlock(b Block) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.State == nil {
		c.State = make(map[string]int)
	}
	if c.Nonces == nil {
		c.Nonces = make(map[string]uint64)
	}
	c.Blocks = append(c.Blocks, b)
	for _, tx := range b.Transactions {
		c.State[tx.From] -= tx.Amount
		c.State[tx.To] += tx.Amount
		if tx.Nonce > c.Nonces[tx.From] {
			c.Nonces[tx.From] = tx.Nonce
		}
	}
}

func (c *Chain) LatestBlock() Block {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.Blocks[len(c.Blocks)-1]
}

func (c *Chain) GetBalance(addr string) int {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.State[addr]
}

func (c *Chain) AddBalance(addr string, amount int) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.State[addr] += amount
}

func (c *Chain) SetBalance(addr string, amount int) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.State[addr] = amount
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

func (c *Chain) SetBlocks(blocks []Block) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.Blocks = append([]Block(nil), blocks...)
}

func (c *Chain) RebuildStateFromBlocks() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.State = make(map[string]int)
	c.Nonces = make(map[string]uint64)
	for _, b := range c.Blocks {
		for _, tx := range b.Transactions {
			c.State[tx.From] -= tx.Amount
			c.State[tx.To] += tx.Amount
			if tx.Nonce > c.Nonces[tx.From] {
				c.Nonces[tx.From] = tx.Nonce
			}
		}
	}
}

func (c *Chain) CreateGenesisIfNotExists() {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.State == nil {
		c.State = make(map[string]int)
	}
	if c.Nonces == nil {
		c.Nonces = make(map[string]uint64)
	}
	if len(c.Blocks) > 0 {
		return
	}
	c.Blocks = append(c.Blocks, Block{Number: 0, PrevHash: "", Timestamp: 0})
	c.State["0x742d35Cc6634C0532925a3b844Bc454e4438f44e"] = 1000
	c.State["0x742d35Cc6634C0532925a3b844Bc454e4438f44f"] = 1000
}
