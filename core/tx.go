package core

import (
	"crypto/sha256"
	"fmt"
)

type Transaction struct {
	From      string
	To        string
	Amount    int
	Nonce     uint64
	Signature string // simplified for prototype (in prod use real cryptography)
}

func (tx *Transaction) ID() string {
	h := sha256.Sum256([]byte(tx.From + tx.To + string(tx.Amount) + string(tx.Nonce) + tx.Signature))
	return fmt.Sprintf("%x", h)
}