package db

import (
	"database/sql"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
	"github.com/joho/godotenv"
)

var DB *sql.DB

func Init() {
	// Load .env in dev
	if err := godotenv.Load(); err != nil {
		log.Println("no .env file loaded (may be running in prod)")
	}

	conn := os.Getenv("SUPABASE_DB_URL")
	if conn == "" {
		log.Fatal("SUPABASE_DB_URL not set")
	}

	var err error
	DB, err = sql.Open("postgres", conn)
	if err != nil {
		log.Fatalf("failed to open db: %v", err)
	}

	// recommended: limit max open conns for serverless-like hosts
	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(5)
	DB.SetConnMaxLifetime(5 * time.Minute)

	if err := DB.Ping(); err != nil {
		log.Fatalf("db ping failed: %v", err)
	}
	log.Println("Connected to Supabase")
}
