import json
import logging

from dacite import from_dict

from src.import_export import REPEATER_JSON_VERSION_LATEST, BaseImporter, DeckData


class CustomImporter(BaseImporter):
    def parse(self, file: bytes) -> DeckData:
        try:
            json_obj = json.loads(file.decode("utf-8"))
            version = json_obj.get("version")
            if version == REPEATER_JSON_VERSION_LATEST:
                deck_data = from_dict(data_class=DeckData, data=json_obj)
                return deck_data
            else:
                raise ValueError(f"Unknown version {version}")
        except Exception as err:
            logging.error(f"Failed to import file: {err}")
            raise
