.PHONY: dev
dev:
	docker compose up --build -d


.PHONY: format
format:
	docker exec repeater-backend uvx ruff format
