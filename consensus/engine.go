package consensus

import "modular-blockchain-framework/core"

type ConsensusEngine interface {
	Start() error
	Stop() error
	ProposeBlock(txs []core.Transaction) core.Block
	ValidateBlock(b core.Block) bool
}