# Modular Blockchain Framework

A modular, full-stack blockchain framework built from scratch that implements core blockchain concepts such as wallets, transaction signing, mempool handling, Proof-of-Work mining, and a block explorer. The system supports persistent on-chain state using Supabase (PostgreSQL) and provides a React-based dashboard to interact with the blockchain network. The backend node is fully containerized and can be run locally or via Docker.

---

## Features

* Custom blockchain implementation in Go
* Wallet generation using ECDSA (secp256k1)
* Transaction signing and verification
* Mempool for pending transactions
* Proof-of-Work (PoW) consensus and mining
* Persistent storage using Supabase (PostgreSQL)
* React + TypeScript dashboard with block explorer
* Dockerized blockchain node for easy deployment

---

## Tech Stack

### Backend

* Go (Golang)
* Custom Proof-of-Work consensus
* ECDSA cryptography (secp256k1)
* Supabase (PostgreSQL)

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Supabase JavaScript SDK

### DevOps / Deployment

* Docker
* Docker Hub
* Render
* Environment variable–based configuration

---

## Fork and Run Locally (Without Docker)

### 1. Fork and Clone the Repository

```
git clone https://github.com/NanditaPatil-dotcom/modular-blockchain-framework.git
cd modular-blockchain-framework
```

### 2. Backend Setup

Create a `.env` file in the project root:

```
SUPABASE_DB_URL=postgresql://<user>:<password>@<host>:6543/postgres?sslmode=require
PORT=8080
```

Install dependencies and run the node:

```
go mod tidy
go run ./cmd/node -port 8080
```

The RPC server will be available at:

```
http://localhost:8080
```

### 3. Frontend Setup

```
cd dashboard
npm install
npm run dev
```

Create a `dashboard/.env.local` file:

```
VITE_RPC_URL=http://localhost:8080
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

---

## Running the Blockchain Node Using Docker

### 1. Pull the Prebuilt Image

```
docker pull nanditanpatil/modular-blockchain-framework:latest
```

### 2. Run the Container

```
docker run -d \
  --name modular-blockchain-node \
  -p 8080:8080 \
  --env-file .env \
  nanditanpatil/modular-blockchain-framework:latest
```

### 3. Verify the Node

```
curl http://localhost:8080/blocks
```

---

## Accessing the Docker Container (Optional)

To open a shell inside the running container:

```
docker exec -it modular-blockchain-node /bin/sh
```

To view logs:

```
docker logs -f modular-blockchain-node
```

---

## Environment Variable Safety

* `.env` files are not baked into the Docker image
* `.env` is excluded via `.dockerignore` and `.gitignore`
* Secrets are injected at runtime only

---

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
