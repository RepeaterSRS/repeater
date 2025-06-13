.PHONY: dev
dev:
	docker compose up --build -d


.PHONY: format
format:
	docker exec repeater-backend uvx ruff format


.PHONY: test
test:
	docker exec repeater-backend uv run pytest
