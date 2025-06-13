import sys
import yaml
from uvicorn.importer import import_from_string


APP_DIR = "."
APP_STR = "src.main:app"
OUT_PATH = "docs/openapi.yaml"


if __name__ == "__main__":
    sys.path.insert(0, APP_DIR)
    app = import_from_string(APP_STR)
    openapi = app.openapi()

    with open(OUT_PATH, "w+") as f:
        yaml.dump(openapi, f, sort_keys=False)
