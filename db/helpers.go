package db

import (
	"log"
	"time"

	"modular-blockchain-framework/core"
)

func InsertBlock(block *core.Block) (err error) {
	tx, err := DB.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	_, err = tx.Exec(
		`INSERT INTO blocks (number, hash, prev_hash, nonce, timestamp)
		 VALUES ($1,$2,$3,$4,$5)
		 ON CONFLICT (number) DO NOTHING`,
		int64(block.Number), block.Hash, block.PrevHash, int64(block.Nonce), time.Unix(block.Timestamp, 0),
	)
	if err != nil {
		return err
	}

	stmt, err := tx.Prepare(`INSERT INTO transactions (block_number, from_addr, to_addr, amount, signature, created_at)
	                          VALUES ($1,$2,$3,$4,$5,$6)`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, t := range block.Transactions {
		_, err = stmt.Exec(int64(block.Number), t.From, t.To, int64(t.Amount), t.Signature, time.Unix(t.Timestamp, 0))
		if err != nil {
			return err
		}
		if _, err = tx.Exec(`INSERT INTO wallets (address, balance, created_at) VALUES ($1, $2, now()) ON CONFLICT (address) DO NOTHING`, t.From, 0); err != nil {
			return err
		}
		if _, err = tx.Exec(`INSERT INTO wallets (address, balance, created_at) VALUES ($1, $2, now()) ON CONFLICT (address) DO NOTHING`, t.To, 0); err != nil {
			return err
		}
		_, err = tx.Exec(`UPDATE wallets SET balance = balance - $1 WHERE address = $2`, int64(t.Amount), t.From)
		if err != nil {
			return err
		}
		_, err = tx.Exec(`UPDATE wallets SET balance = balance + $1 WHERE address = $2`, int64(t.Amount), t.To)
		if err != nil {
			return err
		}
	}

	if err := tx.Commit(); err != nil {
		return err
	}
	log.Printf("Persisted block %d and %d tx(s) to DB", block.Number, len(block.Transactions))
	return nil
}

func GetLatestBlockNumber() (int, error) {
	var n int
	err := DB.QueryRow(`SELECT COALESCE(MAX(number), -1) FROM blocks`).Scan(&n)
	return n, err
}

func UpsertWalletBalance(address string, balance int) error {
	_, err := DB.Exec(`INSERT INTO wallets(address,balance,created_at) VALUES($1,$2,now())
	                   ON CONFLICT (address) DO UPDATE SET balance = $2`, address, balance)
	return err
}

func LoadChain() ([]core.Block, error) {
	rows, err := DB.Query(`SELECT number, hash, prev_hash, nonce, extract(epoch from timestamp)::bigint as ts
	                        FROM blocks ORDER BY number ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var blocks []core.Block
	for rows.Next() {
		var (
			number int64
			nonce  int64
			ts     int64
			b      core.Block
		)
		if err := rows.Scan(&number, &b.Hash, &b.PrevHash, &nonce, &ts); err != nil {
			return nil, err
		}
		b.Number = uint64(number)
		b.Nonce = uint64(nonce)
		b.Timestamp = ts
		txrows, err := DB.Query(`SELECT from_addr,to_addr,amount,signature,extract(epoch from created_at)::bigint as ts FROM transactions WHERE block_number=$1`, number)
		if err != nil {
			return nil, err
		}
		for txrows.Next() {
			var (
				tx     core.Transaction
				amount int64
				txTs   int64
			)
			if err := txrows.Scan(&tx.From, &tx.To, &amount, &tx.Signature, &txTs); err != nil {
				txrows.Close()
				return nil, err
			}
			tx.Amount = int(amount)
			tx.Timestamp = txTs
			b.Transactions = append(b.Transactions, tx)
		}
		txrows.Close()
		blocks = append(blocks, b)
	}

	return blocks, nil
}
