#!/bin/bash
set -e

echo "Waiting for database..."
for i in {1..30}; do
    if psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
        echo "Database ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "Database connection failed"
        exit 1
    fi
    sleep 2
done

echo "Running migrations..."
alembic upgrade head

echo "Starting application..."
if [ "$1" = "bash" ] || [ "$1" = "sh" ]; then
    exec "$@"
else
    exec uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}
fi
