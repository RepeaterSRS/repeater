.PHONY: dev
dev:
	docker compose up --build -d


.PHONY: format
format:
	docker exec repeater-backend uvx ruff format


.PHONY: test
test:
	docker exec repeater-backend uv run pytest


.PHONY: export-openapi
export-openapi:
	docker exec repeater-backend python scripts/extract-openapi.py
	docker cp repeater-backend:/tmp/openapi.yaml docs/openapi.yaml
