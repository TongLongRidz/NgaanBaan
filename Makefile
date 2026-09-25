.PHONY: help frontend backend db-up db-down dev docker-up docker-down

help:
	@echo "Available Makefile commands:"
	@echo "  make frontend    - Run Next.js frontend development server"
	@echo "  make backend     - Run Go backend development server"
	@echo "  make db-up       - Start PostgreSQL database container via docker-compose"
	@echo "  make db-down     - Stop PostgreSQL database container"
	@echo "  make docker-up   - Start all services (db, backend, frontend) via docker-compose"
	@echo "  make docker-down - Stop all docker-compose services"

frontend:
	@echo "Starting Next.js Frontend..."
	cd frontend && npm run dev

backend:
	@echo "Starting Go Backend..."
	cd backend && go run ./cmd/server

db-up:
	@echo "Starting PostgreSQL database container..."
	docker-compose up -d postgres

db-down:
	@echo "Stopping PostgreSQL database container..."
	docker-compose stop postgres

docker-up:
	@echo "Starting all full-stack services..."
	docker-compose up -d

docker-down:
	@echo "Stopping all full-stack services..."
	docker-compose down
