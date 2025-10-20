package core

import "sync"

type Mempool struct {
    mu  sync.Mutex
    txs []Transaction
}

func NewMempool() *Mempool { return &Mempool{} }

func (m *Mempool) Push(tx Transaction) {
    m.mu.Lock()
    m.txs = append(m.txs, tx)
    m.mu.Unlock()
}

func (m *Mempool) PopMany(n int) []Transaction {
    m.mu.Lock()
    defer m.mu.Unlock()
    if n <= 0 || len(m.txs) == 0 { return nil }
    if n > len(m.txs) { n = len(m.txs) }
    slice := m.txs[:n]
    m.txs = m.txs[n:]
    return slice
}

func (m *Mempool) Len() int {
    m.mu.Lock()
    defer m.mu.Unlock()
    return len(m.txs)
}