import uuid
from datetime import datetime, timezone


class is_uuid_string:
    def __eq__(self, value):
        try:
            uuid.UUID(value)
            return True
        except Exception:
            return False


class is_utc_isoformat_string:
    def __eq__(self, value):
        try:
            if value.endswith("Z"):
                value = value.replace("Z", "+00:00")
            dt = datetime.fromisoformat(value)
            return dt.tzinfo is not None and dt.utcoffset() == timezone.utc.utcoffset(
                dt
            )
        except Exception:
            return False
