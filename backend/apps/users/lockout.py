"""Lock an account out of the login API after repeated failed attempts.

Failures are counted per username in the Django cache. Once a username reaches
``LOGIN_LOCKOUT_THRESHOLD`` failures inside ``LOGIN_LOCKOUT_WINDOW`` seconds it is
locked for ``LOGIN_LOCKOUT_DURATION`` seconds, and even the right password is refused
until the lock expires. A successful login clears the count.
"""

import hashlib
import time

from django.conf import settings
from django.core.cache import cache


def _setting(name, default):
    return getattr(settings, name, default)


def _key(kind, username):
    digest = hashlib.sha256((username or "").strip().lower().encode()).hexdigest()
    return f"login-lockout:{kind}:{digest}"


def seconds_locked(username):
    """Seconds left on the lock for this username, or 0 when it is not locked."""
    until = cache.get(_key("until", username))
    if not until:
        return 0
    return max(0, int(until - time.time()))


def record_failure(username):
    """Count a failed attempt; lock the username when it reaches the threshold."""
    threshold = _setting("LOGIN_LOCKOUT_THRESHOLD", 5)
    window = _setting("LOGIN_LOCKOUT_WINDOW", 15 * 60)
    duration = _setting("LOGIN_LOCKOUT_DURATION", 15 * 60)

    failures_key = _key("failures", username)
    cache.add(failures_key, 0, timeout=window)
    try:
        failures = cache.incr(failures_key)
    except ValueError:  # expired between add() and incr()
        cache.set(failures_key, 1, timeout=window)
        failures = 1

    if failures >= threshold:
        cache.set(_key("until", username), time.time() + duration, timeout=duration)
        cache.delete(failures_key)


def clear(username):
    cache.delete_many([_key("failures", username), _key("until", username)])
