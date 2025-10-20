package core

import "sync"

type Mempool struct {
    Mu  sync.RWMutex
    Txs []Transaction
}

func NewMempool() *Mempool { return &Mempool{} }

func (m *Mempool) Push(tx Transaction) {
    m.Mu.Lock()
    m.Txs = append(m.Txs, tx)
    m.Mu.Unlock()
}

func (m *Mempool) PopMany(n int) []Transaction {
    m.Mu.Lock()
    defer m.Mu.Unlock()
    if n <= 0 || len(m.Txs) == 0 { return nil }
    if n > len(m.Txs) { n = len(m.Txs) }
    slice := m.Txs[:n]
    m.Txs = m.Txs[n:]
    return slice
}

func (m *Mempool) Len() int {
    m.Mu.RLock()
    defer m.Mu.RUnlock()
    return len(m.Txs)
}