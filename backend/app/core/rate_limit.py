"""
Very small per-IP sliding-window rate limiter.

This is intentionally simple: it keeps counts in process memory, which is
correct for a single Railway instance but NOT correct once you scale to
multiple replicas (each instance has its own counters). For multi-instance
deployments, swap this for Redis-backed limiting (e.g. `slowapi` +
`redis`, or an edge/CDN rate limiter) -- see README "Future Work".
"""
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import get_settings

settings = get_settings()

_WINDOW_SECONDS = 60
_hits: dict[str, deque] = defaultdict(deque)


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Only throttle mutating / expensive endpoints; static and health
        # checks stay unthrottled.
        if request.method in ("POST", "PUT", "PATCH") or request.url.path.startswith(
            "/api/pipeline"
        ):
            client_ip = request.client.host if request.client else "unknown"
            now = time.time()
            bucket = _hits[client_ip]
            while bucket and now - bucket[0] > _WINDOW_SECONDS:
                bucket.popleft()
            if len(bucket) >= settings.RATE_LIMIT_PER_MINUTE:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests, please slow down and try again shortly.",
                )
            bucket.append(now)
        return await call_next(request)
