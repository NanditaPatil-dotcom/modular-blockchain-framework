# modular-blockchain-framework

A modular blockchain framework written in Go, featuring core blockchain components, consensus mechanisms, and extensible modules.
# to use the repo
1) fork the repo
2) clone it
   ```
   git clone https://github.com/NanditaPatil-dotcom/modular-blockchain-framework/.git
   ```
3) in the project root(backend):
   ```
   go run cmd/node/main.go
    ```
4) for the frontend :
   ```
   cd dashboard
   npm run dev
   ```

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
