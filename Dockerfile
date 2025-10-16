# -------- STAGE 1: Build the Go binary --------
FROM golang:1.21-alpine AS build

WORKDIR /app

# Copy go.mod only (skip go.sum if missing)
COPY go.mod ./

# Download dependencies (will be empty if none)
RUN go mod download

# Copy all source code
COPY . .

# Build your node binary
RUN go build -o /modular-blockchain-framework ./cmd/node

# -------- STAGE 2: Run minimal image --------
FROM alpine:latest

COPY --from=build /modular-blockchain-framework /modular-blockchain-framework

WORKDIR /
EXPOSE 8080

CMD ["/modular-blockchain-framework"]
