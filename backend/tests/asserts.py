import uuid


class IsUUIDString:
    def __eq__(self, other):
        try:
            uuid.UUID(other)
            return True
        except Exception:
            return False
