package modules

import (
	"errors"
	"modular-blockchain-framework/core"
)

type TokenModule struct {
	chain *core.Chain
}

func (m *TokenModule) Name() string { return "token" }
func (m *TokenModule) Init(c *core.Chain) { m.chain = c }

// Very naive checks for prototype: signature + nonce checks are omitted for brevity
func (m *TokenModule) HandleTransaction(tx core.Transaction) error {
	if m.chain.GetBalance(tx.From) < tx.Amount {
		return errors.New("insufficient funds")
	}
	// apply immediately into a temporary state; real code would apply during block finalize
	m.chain.State[tx.From] -= tx.Amount
	m.chain.State[tx.To] += tx.Amount
	return nil
}