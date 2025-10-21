package rpc

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
	"sync"
	"modular-blockchain-framework/core"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/common/hexutil"
)

var faucetRequests = struct{
    mu sync.Mutex
    last map[string]time.Time
}{ last: make(map[string]time.Time) }

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*") // dev: wildcard. In prod, set your frontend URL.
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

type RPCServer struct {
	chain   *core.Chain
	mempool *core.Mempool
}

func New(chain *core.Chain, mempool *core.Mempool) *RPCServer {
	return &RPCServer{chain: chain, mempool: mempool}
}

func VerifySignature(address string, message []byte, sigHex string) (bool, error) {
	sig, err := hexutil.Decode(sigHex)
	if err != nil {
		return false, err
	}
	pubKey, err := crypto.Ecrecover(crypto.Keccak256(message), sig)
	if err != nil {
		return false, err
	}
	pk, err := crypto.UnmarshalPubkey(pubKey)
	if err != nil {
		return false, err
	}
	recoveredAddr := crypto.PubkeyToAddress(*pk).Hex()
	return strings.EqualFold(recoveredAddr, address), nil
}

func (r *RPCServer) ValidateTx(tx *core.Transaction) error {
	// Check balance
	balance := r.chain.GetBalance(tx.From)
	if balance < tx.Amount {
		return fmt.Errorf("insufficient balance: have %d, need %d", balance, tx.Amount)
	}

	// Check amount is positive
	if tx.Amount <= 0 {
		return fmt.Errorf("amount must be positive")
	}

	// Check nonce (prevent replay attacks)
	currentNonce := r.chain.GetNonce(tx.From)
	if tx.Nonce <= currentNonce {
		return fmt.Errorf("invalid nonce: got %d, expected > %d", tx.Nonce, currentNonce)
	}

	// Verify signature
	if tx.Signature == "" {
		return fmt.Errorf("missing signature")
	}

	// Create message for signing: JSON.stringify({from,to,amount,nonce})
	message := fmt.Sprintf(`{"from":"%s","to":"%s","amount":%d,"nonce":%d}`, tx.From, tx.To, tx.Amount, tx.Nonce)
	valid, err := VerifySignature(tx.From, []byte(message), tx.Signature)
	if err != nil {
		return fmt.Errorf("signature verification error: %v", err)
	}
	if !valid {
		return fmt.Errorf("invalid signature")
	}

	return nil
}

func (r *RPCServer) Start(addr string) {
	mux := http.NewServeMux()

	// root handler
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte(`<h1>RPC is alive!</h1><p>Use /balance and /submitTx endpoints.</p>`))
	})

	// get balance
	mux.HandleFunc("/balance", func(w http.ResponseWriter, req *http.Request) {
		q := req.URL.Query().Get("addr")
		bal := r.chain.GetBalance(q)
		json.NewEncoder(w).Encode(map[string]interface{}{"address": q, "balance": bal})
	})

	// submit transaction
	mux.HandleFunc("/submitTx", func(w http.ResponseWriter, req *http.Request) {
		var tx core.Transaction
		if err := json.NewDecoder(req.Body).Decode(&tx); err != nil {
			http.Error(w, "invalid body", 400)
			return
		}
		// server-side: verify signature + nonce + balance (function ValidateTx)
		if err := r.ValidateTx(&tx); err != nil {
			http.Error(w, err.Error(), 400)
			return
		}
		r.mempool.Push(tx)
		json.NewEncoder(w).Encode(map[string]string{"status": "accepted"})
	})

	// get mempool
	mux.HandleFunc("/mempool", func(w http.ResponseWriter, req *http.Request) {
		r.mempool.Mu.RLock()
		txs := make([]core.Transaction, len(r.mempool.Txs))
		copy(txs, r.mempool.Txs)
		r.mempool.Mu.RUnlock()
		json.NewEncoder(w).Encode(txs)
	})

	// health endpoint
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	// healthz endpoint for load balancers/health checks
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	// broadcast block (for inter-node communication)
	mux.HandleFunc("/broadcastBlock", func(w http.ResponseWriter, req *http.Request) {
		var block core.Block
		if err := json.NewDecoder(req.Body).Decode(&block); err != nil {
			http.Error(w, "invalid block", 400)
			return
		}
		// Add block to chain (basic implementation)
		r.chain.AddBlock(block)
		json.NewEncoder(w).Encode(map[string]string{"status": "received"})
	})

	// receive block (for inter-node communication)
	mux.HandleFunc("/receiveBlock", func(w http.ResponseWriter, req *http.Request) {
		var block core.Block
		if err := json.NewDecoder(req.Body).Decode(&block); err != nil {
			http.Error(w, "invalid block", 400)
			return
		}
		// Add block to chain
		r.chain.AddBlock(block)
		json.NewEncoder(w).Encode(map[string]string{"status": "accepted"})
	})

	// addBalance endpoint
	mux.HandleFunc("/addBalance", func(w http.ResponseWriter, req *http.Request) {
		if req.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		type reqBody struct {
			UserId string `json:"userId"`
			Amount int    `json:"amount"`
		}
		var rb reqBody
		if err := json.NewDecoder(req.Body).Decode(&rb); err != nil || rb.UserId == "" || rb.Amount <= 0 {
			http.Error(w, "invalid body", http.StatusBadRequest)
			return
		}

		// Add balance to the user's address
		r.chain.State[rb.UserId] += rb.Amount

		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"newBalance": r.chain.GetBalance(rb.UserId),
		})
	})

	// faucet endpoint
	mux.HandleFunc("/faucet", func(w http.ResponseWriter, req *http.Request) {
		if req.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		type reqBody struct {
			Address string `json:"address"`
		}
		var rb reqBody
		if err := json.NewDecoder(req.Body).Decode(&rb); err != nil || rb.Address == "" {
			http.Error(w, "invalid body", http.StatusBadRequest)
			return
		}

		faucetRequests.mu.Lock()
		last, ok := faucetRequests.last[rb.Address]
		if ok && time.Since(last) < 24*time.Hour {
			faucetRequests.mu.Unlock()
			http.Error(w, "faucet: only 1 request per 24h allowed", http.StatusTooManyRequests)
			return
		}
		// mark time first (prevent double-spend in concurrent requests)
		faucetRequests.last[rb.Address] = time.Now()
		faucetRequests.mu.Unlock()

		// credit amount (e.g., 50 testcoins)
		amount := 50
		r.chain.State[rb.Address] += amount

		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":"ok","address":rb.Address,"amount":amount,"balance": r.chain.GetBalance(rb.Address),
		})
	})

	// listen on all interfaces (Docker-friendly)
	http.ListenAndServe(addr, enableCORS(mux))
}
