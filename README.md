# modular-blockchain-framework

A modular blockchain framework written in Go, featuring core blockchain components, consensus mechanisms, and extensible modules.

## Features

- **Core Components**: Block, Transaction, and Blockchain structures
- **Consensus Engines**: Pluggable consensus mechanisms (PoW, PoS, etc.)
- **Modular Architecture**: Extensible modules for custom functionality
- **RPC Server**: HTTP API for blockchain interaction
- **Docker Support**: Containerized deployment

## Project Structure

```
modular-blockchain-framework/
├─ cmd/
│  └─ node/
│     └─ main.go          # Main application entry point
├─ core/
│  ├─ block.go            # Block data structure and methods
│  ├─ chain.go            # Blockchain management
│  └─ tx.go               # Transaction data structure
├─ consensus/
│  ├─ engine.go           # Consensus engine interface
│  └─ pow.go              # Proof-of-Work implementation
├─ modules/
│  ├─ module.go           # Module interface
│  └─ token.go            # Token module example
├─ rpc/
│  └─ server.go           # HTTP RPC server
├─ go.mod                 # Go module definition
├─ Dockerfile             # Docker container configuration
└─ README.md              # This file
```

## Getting Started

1. Clone the repository
2. Run `go mod tidy` to install dependencies
3. Build with `go build ./cmd/node`
4. Run the node with `./node`

## Transaction Flow Example
**Example: Y1 giving 10 bucks to Y2**

### Step 1: Y1 creates TX
```
┌───────────────────────────────┐
│ TX: {from: Y1, to: Y2,        │
│     amount: 10, nonce: 23,    │
│     signature: 0xabc123...}   │
└───────────────────────────────┘
               │
               ▼
```

### Step 2: TX sent to Y1's node
```
┌───────────────────────────────┐
│ Node checks:                  │
│ - Balance >= 10?              │
│ - Signature valid?            │
│ - Nonce correct?              │
└───────────────────────────────┘
               │ Valid
               ▼
```

### Step 3: Node adds TX to mempool
```
┌───────────────────────────────┐
│ Pending TXs collected for     │
│ next block                    │
└───────────────────────────────┘
               │
               ▼
```

### Step 4: Block creation & consensus
```
┌───────────────────────────────┐
│ New Block:                    │
│ - Previous hash               │
│ - Transactions (incl. TX)     │
│ - Nonce / Validator info      │
│                               │
│ Consensus Engine:             │
│ - PoW: solve hash puzzle      │
│ - PoS: validator signs block  │
└───────────────────────────────┘
               │
               ▼
```

### Step 5: Block broadcast to peers
```
┌───────────────────────────────┐
│ Other nodes receive block     │
│ Each node verifies:           │
│ - TXs valid                   │
│ - Block valid                 │
└───────────────────────────────┘
               │
               ▼
```

### Step 6: Block added to chain
```
┌───────────────────────────────┐
│ All nodes now have updated    │
│ state:                        │
│ Y1 balance: -10               │
│ Y2 balance: +10               │
└───────────────────────────────┘
```
