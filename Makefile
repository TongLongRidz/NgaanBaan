.PHONY: help frontend backend db-up db-down db-init db-reset dev docker-up docker-down

help:
	@echo "Available Makefile commands:"
	@echo "  make frontend    - Run Next.js frontend development server"
	@echo "  make backend     - Run Go backend development server"
	@echo "  make db-up       - Start PostgreSQL database container via docker-compose"
	@echo "  make db-down     - Stop PostgreSQL database container"
	@echo "  make db-init     - Initialize database schema into PostgreSQL"
	@echo "  make db-reset    - Stop containers and remove volumes (fresh database start)"
	@echo "  make docker-up   - Start all services (db, backend, frontend) via docker-compose"
	@echo "  make docker-down - Stop all docker-compose services"

frontend:
	@echo "Starting Next.js Frontend..."
	cd frontend && npm run dev

backend:
	@echo "Starting Go Backend..."
	cd backend && go run ./cmd/server

db-up:
	@echo "Starting Database containers (PostgreSQL & MongoDB)..."
	docker-compose up -d postgres mongodb

db-down:
	@echo "Stopping Database containers (PostgreSQL & MongoDB)..."
	docker-compose stop postgres mongodb

db-init:
	@echo "Initializing database schema into PostgreSQL..."
	docker exec -i ngaanbaan_postgres psql -U ngaanbaan_user -d ngaanbaan_db < backend/init.sql

db-reset:
	@echo "Stopping containers and deleting all database volumes..."
	docker-compose down -v

docker-up:
	@echo "Starting all full-stack services..."
	docker-compose up -d

docker-down:
	@echo "Stopping all full-stack services..."
	docker-compose down
