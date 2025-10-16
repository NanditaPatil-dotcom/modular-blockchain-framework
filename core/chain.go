package core

import (
	"sync"
)

type Chain struct {
	mu     sync.RWMutex
	Blocks []Block
	State  map[string]int // simple state: balances
}

func NewChain() *Chain {
	c := &Chain{State: make(map[string]int)}
	// genesis
	c.Blocks = append(c.Blocks, Block{Number: 0, PrevHash: "", Timestamp: 0})
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