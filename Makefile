.PHONY: dev backend frontend db-up

dev: db-up backend frontend

db-up:
	docker compose up -d db

backend:
	docker compose up --build backend

frontend:
	docker compose up frontend
