from collections import defaultdict
from datetime import datetime, timedelta
from config import settings

_call_log: dict[str, list[datetime]] = defaultdict(list)


def check_rate_limit(user_id: str) -> bool:
    limit = settings.gemini_rate_limit_per_hour
    now = datetime.now()
    hour_ago = now - timedelta(hours=1)
    _call_log[user_id] = [t for t in _call_log[user_id] if t > hour_ago]
    if len(_call_log[user_id]) >= limit:
        return False
    _call_log[user_id].append(now)
    return True


def remaining_calls(user_id: str) -> int:
    limit = settings.gemini_rate_limit_per_hour
    now = datetime.now()
    hour_ago = now - timedelta(hours=1)
    _call_log[user_id] = [t for t in _call_log[user_id] if t > hour_ago]
    return max(0, limit - len(_call_log[user_id]))
