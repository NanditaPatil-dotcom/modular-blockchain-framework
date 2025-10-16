package core

import (
	"fmt"
	"time"
)
func NewBlock() {
    fmt.Println("Block created at:", time.Now())
}
type Block struct {
	Number       uint64
	PrevHash     string
	Timestamp    int64
	Transactions []Transaction
	Nonce        uint64
	Hash         string
}