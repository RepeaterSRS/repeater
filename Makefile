.PHONY: format
format:
	docker exec repeater-backend uvx ruff check --select I --fix
	docker exec repeater-backend uvx ruff format
	docker exec repeater-web pnpm exec prettier --write .


.PHONY: build-and-start-local
build-and-start-local:
	docker compose up --build -d


.PHONY: reset-db
reset-db:
	docker compose down db --volumes


.PHONY: test
test:
	docker exec repeater-backend uv run pytest -s --tb=short


.PHONY: export-openapi
export-openapi:
	docker exec repeater-backend python scripts/extract-openapi.py
	docker cp repeater-backend:/tmp/openapi.yaml docs/openapi.yaml

.PHONY: generate-client
generate-client: export-openapi
	docker exec repeater-web pnpm run openapi-ts


.PHONY: migrate-and-bootstrap
migrate-and-bootstrap:
	docker exec repeater-backend alembic upgrade head
	docker exec repeater-backend python scripts/bootstrap.py


.PHONY: dev
dev: reset-db build-and-start-local migrate-and-bootstrap
