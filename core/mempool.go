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
	if n <= 0 || len(m.Txs) == 0 {
		return nil
	}
	if n > len(m.Txs) {
		n = len(m.Txs)
	}
	slice := m.Txs[:n]
	m.Txs = m.Txs[n:]
	return slice
}

func (m *Mempool) PendingTransactions() []Transaction {
	m.Mu.RLock()
	defer m.Mu.RUnlock()
	if len(m.Txs) == 0 {
		return nil
	}
	txs := make([]Transaction, len(m.Txs))
	copy(txs, m.Txs)
	return txs
}

func (m *Mempool) ClearMined(txs []Transaction) {
	if len(txs) == 0 {
		return
	}
	ids := make(map[string]struct{}, len(txs))
	for i := range txs {
		ids[txs[i].ID()] = struct{}{}
	}
	m.Mu.Lock()
	defer m.Mu.Unlock()
	if len(m.Txs) == 0 {
		return
	}
	filtered := m.Txs[:0]
	for i := range m.Txs {
		if _, ok := ids[m.Txs[i].ID()]; ok {
			continue
		}
		filtered = append(filtered, m.Txs[i])
	}
	m.Txs = filtered
}

func (m *Mempool) Clear() {
	m.Mu.Lock()
	m.Txs = nil
	m.Mu.Unlock()
}

func (m *Mempool) Len() int {
	m.Mu.RLock()
	defer m.Mu.RUnlock()
	return len(m.Txs)
}
