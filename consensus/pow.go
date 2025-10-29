package consensus

import (
	"crypto/sha256"
	"fmt"
	"modular-blockchain-framework/core"
	"strconv"
	"strings"
	"time"
)

type PoW struct {
	chain      *core.Chain
	difficulty int // small number for dev, e.g., 2
	running    bool
}

func NewPoW(c *core.Chain, diff int) *PoW { return &PoW{chain: c, difficulty: diff} }

func (p *PoW) Start() error {
	p.running = true
	go func() {
		for p.running {
			// simple loop: gather pending txs from a global mempool (you'll implement)
			// Here we'll fake an empty block every 5s for demo
			time.Sleep(9 * time.Second)
			b := core.Block{
				Number:       uint64(len(p.chain.Blocks)),
				PrevHash:     p.chain.Blocks[len(p.chain.Blocks)-1].Hash,
				Timestamp:    time.Now().Unix(),
				Transactions: []core.Transaction{}, // wire your mempool
			}
			nonce, hash := mine(b, p.difficulty)
			b.Nonce = nonce
			b.Hash = hash
			p.chain.AddBlock(b)
			fmt.Println("Mined block", b.Number, hash)
		}
	}()
	return nil
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

func mine(b core.Block, diff int) (uint64, string) {
	var nonce uint64
	for {
		nonce++
		h := sha256.Sum256([]byte(fmt.Sprintf("%d%s%d%d", b.Number, b.PrevHash, nonce, b.Timestamp)))
		hs := fmt.Sprintf("%x", h)
		// VERY small difficulty check: starts with diff zeros
		if hs[:diff] == strings.Repeat("0", diff) {
			return nonce, hs
		}
		// Remove the break condition to allow mining to continue until found
	}
	return nonce, fmt.Sprintf("%x", sha256.Sum256([]byte(strconv.FormatUint(nonce, 10))))
}
