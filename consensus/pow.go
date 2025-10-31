package consensus

import (
	"crypto/sha256"
	"fmt"
	"log"
	"modular-blockchain-framework/core"
	"modular-blockchain-framework/db"
	"strings"
	"time"
)

type PoW struct {
	chain      *core.Chain
	mempool    *core.Mempool
	difficulty int // small number for dev, e.g., 2
	running    bool
}

func NewPoW(c *core.Chain, m *core.Mempool, diff int) *PoW {
	return &PoW{chain: c, mempool: m, difficulty: diff}
}

func (p *PoW) Start() error {
	p.running = true
	go func() {
		for p.running {
			if !p.mine() {
				time.Sleep(time.Second)
			}
		}
	}()
	return nil
}

func (p *PoW) mine() bool {
	txs := p.mempool.PendingTransactions()
	if len(txs) == 0 {
		return false
	}
	last := p.chain.LatestBlock()
	timestamp := time.Now().Unix()
	for i := range txs {
		if txs[i].Timestamp == 0 {
			txs[i].Timestamp = timestamp
		}
	}
	block := core.Block{
		Number:       last.Number + 1,
		PrevHash:     last.Hash,
		Timestamp:    timestamp,
		Transactions: txs,
	}
	nonce, hash := mineBlock(block, p.difficulty)
	block.Nonce = nonce
	block.Hash = hash
	p.chain.AddBlock(block)
	if err := db.InsertBlock(&block); err != nil {
		log.Println("warning: failed to persist block:", err)
	}
	p.mempool.Clear()
	fmt.Println("Mined block", block.Number, hash)
	return true
}

func (p *PoW) Stop() error { p.running = false; return nil }

func (p *PoW) ProposeBlock(txs []core.Transaction) core.Block {
	// create block; real miner would include txs
	return core.Block{}
}

func (p *PoW) ValidateBlock(b core.Block) bool {
	// check hash difficulty
	h := sha256.Sum256([]byte(fmt.Sprintf("%d%s%d%d", b.Number, b.PrevHash, b.Nonce, b.Timestamp)))
	hs := fmt.Sprintf("%x", h)
	return hs[:p.difficulty] == strings.Repeat("0", p.difficulty)
}

func mineBlock(b core.Block, diff int) (uint64, string) {
	var nonce uint64
	for {
		nonce++
		h := sha256.Sum256([]byte(fmt.Sprintf("%d%s%d%d", b.Number, b.PrevHash, nonce, b.Timestamp)))
		hs := fmt.Sprintf("%x", h)
		if hs[:diff] == strings.Repeat("0", diff) {
			return nonce, hs
		}
	}
}
