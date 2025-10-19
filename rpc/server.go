package rpc

import (
	"encoding/json"
	"net/http"
	"modular-blockchain-framework/core"
)

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
	chain *core.Chain
}

func New(chain *core.Chain) *RPCServer {
	return &RPCServer{chain: chain}
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
		_ = json.NewDecoder(req.Body).Decode(&tx)
		// naive: apply immediately via token module or mempool
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	// health endpoint
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})

	// listen on all interfaces (Docker-friendly)
	http.ListenAndServe(addr, enableCORS(mux))
}
