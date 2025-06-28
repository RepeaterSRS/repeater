BACKEND_CONTAINER=repeater-backend
FRONTEND_CONTAINER=repeater-web
BACKEND_EXEC=docker exec $(BACKEND_CONTAINER)
FRONTEND_EXEC=docker exec $(FRONTEND_CONTAINER)


.PHONY: format
format:
	$(BACKEND_EXEC) uvx ruff check --select I --fix
	$(BACKEND_EXEC) uvx ruff format
	$(FRONTEND_EXEC) pnpm exec prettier --write .


.PHONY: build-and-start-local
build-and-start-local:
	docker compose up --build -d


.PHONY: reset-db
reset-db:
	docker compose down db --volumes


.PHONY: test
test:
	$(BACKEND_EXEC) uv run pytest -s --tb=short


.PHONY: revision
revision:
	$(BACKEND_EXEC) alembic revision --autogenerate -m "$(m)"


.PHONY: export-openapi
export-openapi:
	$(BACKEND_EXEC) python scripts/extract-openapi.py
	docker cp repeater-backend:/tmp/openapi.yaml docs/openapi.yaml


.PHONY: generate-client
generate-client: export-openapi
	$(FRONTEND_EXEC) pnpm run openapi-ts


.PHONY: migrate-and-bootstrap
migrate-and-bootstrap:
	$(BACKEND_EXEC) alembic upgrade head
	$(BACKEND_EXEC) python -m src.db.bootstrap


.PHONY: dev
dev: reset-db build-and-start-local migrate-and-bootstrap
