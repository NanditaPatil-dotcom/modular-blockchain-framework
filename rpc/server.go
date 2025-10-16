package rpc

import (
	"encoding/json"
	"net/http"
	"modular-blockchain-framework/core"
)

type RPCServer struct {
	chain *core.Chain
}

func New(chain *core.Chain) *RPCServer { return &RPCServer{chain: chain} }

func (r *RPCServer) Start(addr string) {
	http.HandleFunc("/balance", func(w http.ResponseWriter, req *http.Request) {
		q := req.URL.Query().Get("addr")
		bal := r.chain.GetBalance(q)
		json.NewEncoder(w).Encode(map[string]interface{}{"address": q, "balance": bal})
	})
	http.HandleFunc("/submitTx", func(w http.ResponseWriter, req *http.Request) {
		var tx core.Transaction
		_ = json.NewDecoder(req.Body).Decode(&tx)
		// naive: apply immediately via token module or mempool
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})
	http.ListenAndServe(addr, nil)
}