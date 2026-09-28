package repository

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB() *sql.DB {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		host := os.Getenv("POSTGRES_HOST")
		if host == "" {
			host = "localhost"
		}
		port := os.Getenv("POSTGRES_PORT")
		if port == "" {
			port = "5435"
		}
		user := os.Getenv("POSTGRES_USER")
		if user == "" {
			user = "kanban_user"
		}
		password := os.Getenv("POSTGRES_PASSWORD")
		if password == "" {
			password = "kanban_password"
		}
		dbname := os.Getenv("POSTGRES_DB")
		if dbname == "" {
			dbname = "kanban_db"
		}
		dbURL = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", user, password, host, port, dbname)
	}

	var err error
	DB, err = sql.Open("postgres", dbURL)
	if err != nil || DB.Ping() != nil {
		// Fallback for host machine environment outside docker container
		hostURL := fmt.Sprintf("postgres://%s:%s@localhost:5435/%s?sslmode=disable",
			os.Getenv("POSTGRES_USER"),
			os.Getenv("POSTGRES_PASSWORD"),
			os.Getenv("POSTGRES_DB"),
		)
		if fallbackDB, errFallback := sql.Open("postgres", hostURL); errFallback == nil && fallbackDB.Ping() == nil {
			DB = fallbackDB
			err = nil
		}
	}

	if err = DB.Ping(); err != nil {
		log.Printf("Warning: Database ping failed: %v", err)
	} else {
		log.Println("Successfully connected to PostgreSQL database")

		// Auto-initialize tables if empty
		var exists bool
		_ = DB.QueryRow("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')").Scan(&exists)
		if !exists {
			log.Println("Database tables missing. Executing init.sql schema...")
			initBytes, err := os.ReadFile("init.sql")
			if err != nil {
				initBytes, err = os.ReadFile("../init.sql")
			}
			if err == nil {
				_, err = DB.Exec(string(initBytes))
				if err != nil {
					log.Printf("Warning: Failed to execute init.sql: %v", err)
				} else {
					log.Println("Database schema successfully initialized!")
				}
			} else {
				log.Printf("Warning: init.sql file not found: %v", err)
			}
		}
	}

	return DB
}
