package modules

import "modular-blockchain-framework/core"

type Module interface {
	Name() string
	Init(c *core.Chain)
	HandleTransaction(tx core.Transaction) error
}